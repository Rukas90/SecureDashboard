import { createController } from "@shared/base"
import { ICsrfService } from "@shared/csrf"
import { ILoginService } from "@features/auth"
import { extractSessionContext } from "@features/session"
import { AuthCookieService } from "../service/cookie.service"

export const createTotpLoginController = (
  loginService: ILoginService,
  csrfService: ICsrfService,
  authCookie: AuthCookieService,
) =>
  createController(
    async (req, res, next) => {
      const result = await loginService.totpLogin(
        req.session.auth.userId,
        req.session.auth.claims.email_verified,
        extractSessionContext(req),
        req.body.code,
      )
      if (!result.ok) {
        return next(result.error)
      }
      const session = result.data
      authCookie.setAuthSessionCookies(res, session)

      csrfService.setCookie(res)
      res.auth({
        user: session.authUser,
        message: "Logged in successfully.",
      })
    },
    { auth: true },
  )
