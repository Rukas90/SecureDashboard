import { syncController } from "@shared/util"
import { Request, Response, NextFunction } from "express"
import { MfaInvalidMethodError } from "../error/mfa.error"
import { MfaMethod, MfaMethodCollection } from "@project/shared"

const createValidateMfaMethod = () =>
  syncController((req: Request, _: Response, next: NextFunction) => {
    const method = req.params.method as MfaMethod

    if (!method || !MfaMethodCollection.includes(method)) {
      return next(new MfaInvalidMethodError())
    }
    next()
  })
export default createValidateMfaMethod
