import { createController } from "@base/shared/base"
import { ITotpService } from "../service/totp.service"

export const createTotpInitializeController = (totpService: ITotpService) =>
  createController(
    async (req, res, next) => {
      const result = await totpService.getTotpData(req.session.auth.userId)

      if (!result.ok) {
        return next(result.error)
      }
      res.ok(result.data)
    },
    { auth: true },
  )
