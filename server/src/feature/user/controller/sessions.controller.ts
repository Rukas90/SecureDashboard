import { createController } from "@shared/base"
import { IUserService } from "../service/user.service"
import { REFRESH_TOKEN_COOKIE_NAME } from "@features/auth"

export const createUserSessionsController = (userService: IUserService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME]

      const result = await userService.getUserSessions(userId, refreshToken)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok(result.data)
    },
    { auth: true },
  )
