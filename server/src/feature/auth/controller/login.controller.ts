import { ILoginService } from "../service/login.service"
import { createController } from "@shared/base"
import { extractSessionContext } from "@features/session"
import { ICsrfService } from "@shared/csrf"
import {
  AuthCookieService,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../service/cookie.service"

export const createLoginController = (
  loginService: ILoginService,
  csrfService: ICsrfService,
  cookieService: AuthCookieService,
) =>
  createController(async (req, res, next) => {
    const result = await loginService.login(
      req.body.email,
      req.body.password,
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
      extractSessionContext(req),
    )
    if (!result.ok) return next(result.error)

    const session = result.data
    cookieService.setAuthSessionCookies(res, session)

    csrfService.setCookie(res)
    res.auth({
      user: session.authUser,
      message: "Logged in successfully.",
    })
  })
