import { AppConfig } from "@base/app"
import { CookieOptions } from "express"

export const createCsrfCookieOptions = (config: AppConfig): CookieOptions => {
  return {
    httpOnly: false,
    secure: config.isProduction,
    sameSite: "lax",
    path: "/",
    domain: config.domain,
  }
}
