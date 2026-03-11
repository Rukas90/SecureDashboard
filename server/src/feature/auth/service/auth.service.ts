import { ISudoService } from "@features/sudo"
import {
  SessionContext,
  ISessionRepository,
  SessionNotFoundError,
} from "@features/session"
import { UserSession } from "@prisma/client"
import { Result, SessionData, type AuthUser } from "@project/shared"
import { IJwtService, IRefreshRepository, IRefreshService } from "@shared/token"
import { IEnrollmentRepository } from "@features/mfa"
import { AuthFailedError } from "../error/auth.error"

export type AuthSessionInfo = {
  accessToken: string
  authUser: AuthUser
  refreshToken: string
  refreshExpireMs: number
  refreshExpireAt: Date
}
interface CreateSessionUserData {
  userId: string
  isVerified: boolean
}
interface CreateAuthSessionData extends CreateSessionUserData {
  context?: SessionContext
  familyId?: string
  userSession?: UserSession
  options?: CreateAuthSessionOptions
}
export type CreateAuthSessionOptions = {
  activateSudo: boolean
}
const DEFAULT_CREATE_AUTH_SESSION_OPTIONS: CreateAuthSessionOptions = {
  activateSudo: true,
}

export type EstablishedAuthSession =
  | ({ type: "partial" } & Pick<AuthSessionInfo, "accessToken" | "authUser">)
  | ({ type: "full" } & AuthSessionInfo)

export class AuthService {
  constructor(
    private readonly jwtService: IJwtService,
    private readonly enrollmentsRepository: IEnrollmentRepository,
    private readonly refreshService: IRefreshService,
    private readonly refreshRepository: IRefreshRepository,
    private readonly sudoService: ISudoService,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async refreshAuth(refreshCookieToken?: string) {
    const validation =
      await this.refreshService.validateRefreshToken(refreshCookieToken)
    if (!validation.ok) return validation

    const currentToken = validation.data

    const revocation = await this.refreshRepository.revokeByLookupHash(
      currentToken.lookup_hash,
    )
    if (!revocation.ok) return revocation

    const session = await this.sessionRepository.getByFamilyId(
      currentToken.family_id,
    )
    if (!session.ok) return session
    if (!session.data) {
      return Result.error(new SessionNotFoundError())
    }
    const user = currentToken.user

    const auth = await this.createFullAuthSession({
      userId: user.id,
      isVerified: user.is_verified,
      context: undefined,
      familyId: currentToken.family_id,
      userSession: session.data,
      options: {
        activateSudo: false,
      },
    })
    if (!auth.ok) return auth

    const expiryUpdate = await this.sessionRepository.updateExpiry(
      currentToken.family_id,
      currentToken.user.id,
      auth.data.refreshExpireAt,
    )
    if (!expiryUpdate.ok) return expiryUpdate

    return Result.success(auth.data)
  }
  async establishAuthSession({
    userId,
    isVerified,
    context,
  }: Pick<CreateAuthSessionData, keyof CreateSessionUserData | "context">) {
    const mfaConfigResult = await this.hasMfaConfigured(userId)
    if (!mfaConfigResult.ok) return mfaConfigResult

    const mfaConfigured = mfaConfigResult.data

    if (mfaConfigured) {
      return await this.createPartialAuthSession({ userId, isVerified })
    }
    return this.createFullAuthSession({ userId, isVerified, context })
  }
  async createPartialAuthSession({
    userId,
    isVerified,
  }: CreateSessionUserData) {
    const { accessToken, authUser } =
      await this.jwtService.generatePreMfaAccessToken(userId, isVerified)
    return Result.success({ type: "partial" as const, accessToken, authUser })
  }
  async createFullAuthSession({
    userId,
    isVerified,
    context,
    familyId,
    userSession,
    options = DEFAULT_CREATE_AUTH_SESSION_OPTIONS,
  }: CreateAuthSessionData) {
    try {
      familyId ??= this.refreshService.createFamilyId()

      const {
        token: refreshToken,
        expireAt,
        expiryMs,
      } = await this.refreshService.generateRefreshToken(userId, familyId)

      let session = userSession

      session ??= await Result.orThrowAsync(
        this.sessionRepository.create(familyId, userId, context, expireAt),
      )
      const { accessToken, authUser } =
        await this.jwtService.generateFullAccessToken(
          userId,
          isVerified,
          session.id,
        )

      if (options.activateSudo) {
        await this.sudoService.activateSudo(session.id)
      }
      const auth: EstablishedAuthSession = {
        type: "full",
        accessToken,
        authUser,
        refreshToken,
        refreshExpireMs: expiryMs,
        refreshExpireAt: expireAt,
      }
      return Result.success(auth)
    } catch (error) {
      console.error(error)
      return Result.error(new AuthFailedError())
    }
  }
  async hasMfaConfigured(userId: string) {
    const result =
      await this.enrollmentsRepository.countConfiguredByUserId(userId)

    if (!result.ok) return result

    return Result.success(result.data > 0)
  }
  async getSessionData(
    accessToken?: string,
    refreshToken?: string,
  ): Promise<SessionData> {
    const user = await this.getAuthUser(accessToken)
    const canRefresh = !user && !!refreshToken

    return { user, canRefresh }
  }
  async getAuthUser(accessToken?: string) {
    if (!accessToken) return null

    const result = await this.jwtService.validateAccessToken(accessToken)

    if (!result.ok) return null

    const payload = result.data
    const expirationInSeconds = payload.exp

    if (!expirationInSeconds) return null

    const user: AuthUser = {
      scope: payload.scope,
      expiresAt: expirationInSeconds * 1000,
    }
    return user
  }
}
export type IAuthService = Pick<AuthService, keyof AuthService>
