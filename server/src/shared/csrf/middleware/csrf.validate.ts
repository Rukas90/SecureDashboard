import { syncController } from "@shared/util"
import { NextFunction, Request, Response } from "express"
import { CsrfInvalidError } from "../error/csrf.error"
import { ICsrfService } from "../service/csrf.service"
import crypto from "crypto"
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from "@project/shared"

export const createValidateCsrf = (csrfService: ICsrfService) =>
  syncController((req: Request, _: Response, next: NextFunction) => {
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME] as string
    const headerToken = req.headers?.[CSRF_HEADER_NAME] as string

    if (!cookieToken || !headerToken) {
      return next(new CsrfInvalidError())
    }
    if (cookieToken.length !== headerToken.length) {
      return next(new CsrfInvalidError())
    }
    if (
      !csrfService.verifyToken(cookieToken) ||
      !csrfService.verifyToken(headerToken)
    ) {
      return next(new CsrfInvalidError())
    }
    if (
      !crypto.timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken),
      )
    ) {
      return next(new CsrfInvalidError())
    }
    next()
  })
