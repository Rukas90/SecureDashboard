import { createController } from "@shared/base"
import { ISessionRevokeService } from "../service/revocation.service"
import { REFRESH_TOKEN_COOKIE_NAME } from "@features/auth"

export const createRevokeSessionController = (
  revokeService: ISessionRevokeService,
) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const sessionId = req.params.sessionId as string
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

      const result = await revokeService.revokeSession(
        userId,
        sessionId,
        refreshToken,
      )
      if (!result.ok) {
        return next(result.error)
      }
      res.ok("Session revoked successfully.")
    },
    { auth: true },
  )
