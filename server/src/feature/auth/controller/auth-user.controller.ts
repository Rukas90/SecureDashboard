import { createController } from "@shared/base"
import { IAuthService } from "../service/auth.service"
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AuthCookieService,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../service/cookie.service"

export const createAuthUserController = (
  authService: IAuthService,
  cookieService: AuthCookieService,
) =>
  createController(async (req, res) => {
    const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME]
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

    const session = await authService.getSessionData(accessToken, refreshToken)
    if (!session.user && !session.canRefresh) {
      cookieService.clearAuthTokenCookies(res)
    }
    res.ok(session)
  })
