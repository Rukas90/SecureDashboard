import { createController } from "@shared/base"
import { IAuthService } from "../service/auth.service"
import {
  AuthCookieService,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../service/cookie.service"

export const createRefreshController = (
  authService: IAuthService,
  cookieService: AuthCookieService,
) =>
  createController(async (req, res, next) => {
    const result = await authService.refreshAuth(
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
    )
    if (!result.ok) {
      cookieService.clearAuthTokenCookies(res)
      return next(result.error)
    }
    const session = result.data
    cookieService.setAuthSessionCookies(res, session)

    res.auth({
      user: session.authUser,
      message: "Session refreshed successfully.",
    })
  })
