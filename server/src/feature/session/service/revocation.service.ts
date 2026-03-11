import {
  ACCESS_TOKEN_EXPIRY_MS,
  IRefreshRepository,
  IRefreshService,
} from "@base/shared/token"
import { ISessionRepository } from "../repository/session.repository"
import {
  AuthInvalidSessionError,
  IAuthService,
  IRevocationCache,
} from "@features/auth"
import { Result, VoidResult } from "@project/shared"
import {
  SessionCannotRevokeCurrentError,
  SessionNotFoundError,
  SessionRevokeForeignSessionError,
} from "../error/session.error"

export class SessionRevokeService {
  constructor(
    private readonly refreshRepository: IRefreshRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly refreshService: IRefreshService,
    private readonly revocation: IRevocationCache,
  ) {}

  async revokeSession(userId: string, sessionId: string, refreshToken: string) {
    const session = await this.sessionRepository.getById(sessionId)
    if (!session.ok) return session

    if (!session.data) {
      return Result.error(new SessionNotFoundError())
    }
    if (session.data.user_id !== userId) {
      return Result.error(new SessionRevokeForeignSessionError())
    }
    if (!refreshToken) {
      return Result.error(new AuthInvalidSessionError())
    }
    const tokenResult = await this.refreshService.findRefreshToken(refreshToken)
    if (!tokenResult.ok) return tokenResult

    if (tokenResult.data.family_id === session.data.family_id) {
      return Result.error(new SessionCannotRevokeCurrentError())
    }
    return await this.revokeFamily(session.data.family_id)
  }
  async revokeFamily(familyId: string) {
    const refreshRevoke = await this.refreshRepository.revokeFamily(familyId)
    if (!refreshRevoke.ok) return refreshRevoke

    const session = await this.sessionRepository.revokeByFamilyId(familyId)
    if (!session.ok) return session

    await this.revocation.revokeSession(session.data.id, ACCESS_TOKEN_EXPIRY_MS)
    return VoidResult.ok()
  }
}
export type ISessionRevokeService = Pick<
  SessionRevokeService,
  keyof SessionRevokeService
>
