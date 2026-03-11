import { createController } from "@base/shared/base"
import { ITotpService } from "../service/totp.service"
import { ConfirmEnrollmentResponse } from "@project/shared"

export const createTotpConfirmController = (totpService: ITotpService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const code = req.body.code

      const result = await totpService.confirm(userId, code)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok<ConfirmEnrollmentResponse>({
        backupCodes: result.data,
        message: "Totp enrollment was configured and activated successfully.",
      })
    },
    { auth: true },
  )
