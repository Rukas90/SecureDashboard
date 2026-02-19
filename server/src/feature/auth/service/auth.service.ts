import { database } from "@base/app"
import { appRedis } from "@base/redis"
import { sessionService, SessionContext } from "@features/session"
import { User, UserSession } from "@prisma/client"
import { type AuthUser } from "@project/shared"
import { jwtService, refreshService } from "@shared/token"

export type AuthSessionInfo = {
  accessToken: string
  refreshToken: string
  refreshExpiryDate: Date
  authUser: AuthUser
}

const authService = {
  getAuthUser: async (accessToken?: string): Promise<AuthUser | null> => {
    if (!accessToken) {
      return null
    }
    const result = await jwtService.validateAccessToken(accessToken)

    if (!result.ok) {
      return null
    }
    const payload = result.data
    const expirationInSeconds = payload.exp

    if (!expirationInSeconds) {
      return null
    }
    const user: AuthUser = {
      scope: payload.scope,
      expiresAt: expirationInSeconds * 1000,
    }
    return user
  },
  /**
   * Used to establish user's auth session
   */
  establishUserAuthSession: async (
    user: User,
    context: SessionContext,
  ): Promise<{
    accessToken: string
    refreshToken?: string
    authUser: AuthUser
  }> => {
    if (await authService.hasMfaConfigured(user.id)) {
      return await jwtService.generatePre2faAccessToken(user)
    }
    return await authService.createUserAuthSession(user, context)
  },
  hasMfaConfigured: async (userId: string) => {
    const enrollments = await database.client.mfaEnrollment.findMany({
      where: {
        user_id: userId,
      },
    })
    return enrollments.length > 0 && enrollments.some((e) => e.configured)
  },
  /**
   * Used to generate new user's auth session
   */
  createUserAuthSession: async (
    user: User,
    context?: SessionContext,
    familyId?: string,
    userSession?: UserSession,
  ): Promise<AuthSessionInfo> => {
    familyId ??= refreshService.generateRefreshFamilyId()

    const { refreshToken, expirationDate } =
      await refreshService.generateRefreshToken(user, familyId)

    let session: UserSession =
      userSession ??
      (await sessionService.createSession(
        familyId,
        user.id,
        context,
        expirationDate,
      ))

    const { accessToken, authUser } = await jwtService.generateFullAccessToken(
      session.id,
      user,
    )
    return {
      accessToken,
      refreshToken,
      refreshExpiryDate: expirationDate,
      authUser,
    } satisfies AuthSessionInfo
  },
  revokeSessionFamily: async (familyId: string) => {
    await refreshService.revokeTokenFamily(familyId)
    const session = await sessionService.revokeSession(familyId)

    await appRedis.set(`revoked_session:${session.id}`, "1", {
      ex: Math.ceil(jwtService.constants.ACCESS_TOKEN_EXPIRY_MS / 1000),
    })
  },
}
export default authService
