import { createController } from "@shared/base"
import { IOAuthService } from "../service/oauth.service"
import { OAuthProvider } from "@project/shared"
import { OAuthSession } from "@shared/util"
import { ICsrfService } from "@shared/csrf"
import { AuthCookieService } from "@features/auth"

export const createOAuthCallbackController = (
  oauthService: IOAuthService,
  csrfService: ICsrfService,
  authCookies: AuthCookieService,
) =>
  createController(async (req, res, next) => {
    try {
      const provider = req.params.provider as OAuthProvider
      const code = req.query.code as string | undefined
      const state = req.query.state as string | undefined

      const oauth: OAuthSession | undefined = req.session.oauth

      const result = await oauthService.processCallback(
        provider,
        code,
        state,
        oauth,
      )
      if (!result.ok) {
        return next(result.error)
      }
      const { sessionInfo, redirectUrl } = result.data

      authCookies.setAuthSessionCookies(res, sessionInfo)
      csrfService.setCookie(res)

      res.redirect(redirectUrl)
    } finally {
      delete req.session.oauth
    }
  })
