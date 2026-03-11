import { createController } from "@base/shared/base"
import { IMfaService } from "../service/mfa.service"

export const createUserEnrollmentsController = (mfaService: IMfaService) =>
  createController(
    async (req, res, next) => {
      const result = await mfaService.getUserEnrollments(
        req.session.auth.userId,
      )
      if (!result.ok) return next(result.error)
      res.ok(result.data)
    },
    { auth: true },
  )
