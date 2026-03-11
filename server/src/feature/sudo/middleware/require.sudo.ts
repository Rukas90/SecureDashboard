import { AuthRequest, authController } from "@shared/util"
import { Response, NextFunction } from "express"
import { SudoExpiredError } from "../error/sudo.error"
import { ISudoService } from "../service/sudo.service"

const createRequireSudo = (sudoService: ISudoService) =>
  authController(async (req: AuthRequest, _: Response, next: NextFunction) => {
    const sid = req.session.auth.sid
    if (!sid || !(await sudoService.extendSudo(sid))) {
      return next(new SudoExpiredError())
    }
    next()
  })
export default createRequireSudo
