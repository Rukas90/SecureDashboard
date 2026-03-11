import { createController } from "@shared/base"
import { IUserService } from "../service/user.service"
import { ICsrfService } from "@shared/csrf"
import { AuthCookieService } from "@features/auth"

export const createDeleteAccountController = (
  userService: IUserService,
  csrfService: ICsrfService,
  authCookies: AuthCookieService,
) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const result = await userService.deleteUser(userId)

      if (!result.ok) {
        return next(result.error)
      }
      authCookies.clearAuthTokenCookies(res)
      csrfService.setCookie(res)

      res.ok("Account was deleted successfully.")
    },
    { auth: true },
  )
