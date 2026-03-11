import { ICsrfService } from "@shared/csrf"
import { createController } from "@shared/base"
import { IRegisterService } from "../service/register.service"
import { extractSessionContext } from "@features/session"
import { AuthCookieService } from "../service/cookie.service"

export const createRegisterController = (
  registerService: IRegisterService,
  csrfService: ICsrfService,
  cookieService: AuthCookieService,
) =>
  createController(async (req, res, next) => {
    const result = await registerService.register(
      req.body.email,
      req.body.password,
      extractSessionContext(req),
    )
    if (!result.ok) {
      return next(result.error)
    }
    const session = result.data
    cookieService.setAuthSessionCookies(res, session)

    csrfService.setCookie(res)
    res.auth({
      user: session.authUser,
      message: "Registered and logged in successfully.",
    })
  })
