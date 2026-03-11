import { createController } from "@shared/base"
import { IRecoveryService } from "../service/recovery.service"

export const createRegenerateCodesController = (
  recoveryService: IRecoveryService,
) =>
  createController(
    async (req, res, next) => {
      const result = await recoveryService.createUserCodes(
        req.session.auth.userId,
      )
      if (!result.ok) {
        return next(result.error)
      }
      res.ok(result.data)
    },
    { auth: true },
  )
