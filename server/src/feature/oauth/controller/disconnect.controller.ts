import { createController } from "@base/shared/base"
import { IOAuthService } from "../service/oauth.service"
import { OAuthProvider } from "@project/shared"

export const createOAuthDisconnectController = (oauthService: IOAuthService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const provider = req.params.provider as OAuthProvider

      const result = await oauthService.disconnectOAuthProvider(
        userId,
        provider,
      )
      if (!result.ok) {
        return next(result.error)
      }
      res.ok("Disconnected OAuth provider from user successfully.")
    },
    { auth: true },
  )
