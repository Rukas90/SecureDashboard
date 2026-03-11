import { createController } from "@shared/base"
import { IUserService } from "../service/user.service"
import { SendEmailVerifyResponseDto } from "@project/shared"

export const createSendVerificationController = (userService: IUserService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const result = await userService.sendEmailVerification(userId)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok<SendEmailVerifyResponseDto>({
        retryAfterMs: result.data.retryAfterMs,
        message: "Verification email has been sent.",
      })
    },
    { auth: true },
  )
