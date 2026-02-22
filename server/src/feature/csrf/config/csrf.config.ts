import { CSRF_COOKIE_NAME } from "@project/shared"
import { CookieOptions, Response } from "express"
import csrfService from "../service/csrf.service"
import { config } from "@base/app"

export const CSRF_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: false,
  secure: config().isProduction,
  sameSite: "lax",
  path: "/",
  domain: config().domain,
}

export const generateCsrfCookie = (res: Response) => {
  const token = csrfService.generateCsrfToken()
  res.cookie(CSRF_COOKIE_NAME, token, CSRF_COOKIE_OPTIONS)
  return token
}
export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, CSRF_COOKIE_OPTIONS)
}
