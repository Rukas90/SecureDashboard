import { createController } from "@base/shared/base"
import { IUserService } from "../service/user.service"

export const createUserProfileController = (userService: IUserService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const result = await userService.getProfile(userId)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok(result.data)
    },
    { auth: true },
  )
