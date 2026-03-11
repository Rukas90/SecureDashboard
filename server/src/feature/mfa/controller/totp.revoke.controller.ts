import { createController } from "@base/shared/base"
import { ITotpService } from "../service/totp.service"

export const createTotpRevokeController = (totpService: ITotpService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const code = req.body.code

      const result = await totpService.revoke(userId, code)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok("Enrollment was deleted successfully.")
    },
    { auth: true },
  )
