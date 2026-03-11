import { createController } from "@shared/base"
import { IUserService } from "../service/user.service"
import { ICsrfService } from "@shared/csrf"

export const createPasswordUpdateController = (
  userService: IUserService,
  csrfService: ICsrfService,
) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const result = await userService.updatePassword(userId, req.body)

      if (!result.ok) {
        return next(result.error)
      }
      csrfService.setCookie(res)
      res.ok("Password updated successfully.")
    },
    { auth: true },
  )
