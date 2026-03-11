import { createController } from "@base/shared/base"
import { IOAuthService } from "../service/oauth.service"
import { OAuthProvider } from "@project/shared"

export const createOAuthInitiateController = (oauthService: IOAuthService) =>
  createController(async (req, res) => {
    const provider = req.params.provider as OAuthProvider
    const { state, verifier, url } = oauthService.getAuthorization(provider)

    req.session.oauth = {
      state,
      verifier,
      provider,
    }
    res.redirect(url)
  })
