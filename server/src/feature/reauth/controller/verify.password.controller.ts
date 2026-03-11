import { createController } from "@shared/base"
import { IReauthService } from "../service/reauth.service"

export const createReauthPasswordController = (reauthService: IReauthService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const sid = req.session.auth.sid
      const password = req.body.password as string

      const result = await reauthService.verifyPassword({
        userId,
        sid,
        data: { password },
      })
      if (!result.ok) {
        return next(result.error)
      }
      res.ok("Re-authenticated successfully.")
    },
    { auth: true },
  )
