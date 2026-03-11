import { ICsrfService } from "@shared/csrf"
import { ILogoutService } from "../service/logout.service"
import { createController } from "@shared/base"
import {
  AuthCookieService,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../service/cookie.service"

export const createLogoutController = (
  logoutService: ILogoutService,
  csrfService: ICsrfService,
  cookieService: AuthCookieService,
) =>
  createController(async (req, res, next) => {
    const result = await logoutService.logout(
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
    )
    if (!result.ok) return next(result.error)

    delete req.session.auth
    cookieService.clearAuthTokenCookies(res)

    csrfService.setCookie(res)
    res.ok("Logged out successfully")
  })
