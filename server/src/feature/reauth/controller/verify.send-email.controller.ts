import { createController } from "@shared/base"
import { IReauthService } from "../service/reauth.service"

export const createReauthSendEmailController = (
  reauthService: IReauthService,
) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const sid = req.session.auth.sid

      const result = await reauthService.sendVerifyEmail({ userId, sid })

      if (!result.ok) {
        return next(result.error)
      }
      res.ok(result.data)
    },
    { auth: true },
  )
