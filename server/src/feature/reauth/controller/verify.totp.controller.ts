import { createController } from "@shared/base"
import { IReauthService } from "../service/reauth.service"

export const createReauthTotpController = (reauthService: IReauthService) =>
  createController(
    async (req, res, next) => {
      const userId = req.session.auth.userId
      const sid = req.session.auth.sid
      const code = req.body.code as string

      const result = await reauthService.verifyTotp({
        userId,
        sid,
        data: { code },
      })
      if (!result.ok) {
        return next(result.error)
      }
      res.ok("Re-authenticated successfully.")
    },
    { auth: true },
  )
