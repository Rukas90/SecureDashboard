import { NextFunction, Request, Response } from "express"
import { CSRF_COOKIE_NAME } from "@project/shared"
import { ICsrfService } from "../service/csrf.service"

const SAFE_REQUEST_METHOD = ["GET", "HEAD", "OPTIONS"]

export const createInitializeCsrf =
  (csrfService: ICsrfService) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!SAFE_REQUEST_METHOD.includes(req.method)) {
      return next()
    }
    if (!req.cookies?.[CSRF_COOKIE_NAME]) {
      csrfService.setCookie(res)
    }
    next()
  }
