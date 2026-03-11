import { createController } from "@shared/base"
import { ISudoService } from "../service/sudo.service"

export const createInSudoController = (sudoService: ISudoService) =>
  createController(
    async (req, res) => {
      const sessionId = req.session.auth.sid
      res.ok(!!sessionId && (await sudoService.getInSudo(sessionId)))
    },
    { auth: true },
  )
