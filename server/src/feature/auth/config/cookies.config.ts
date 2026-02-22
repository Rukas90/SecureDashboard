import { config } from "@base/app"
import { CookieOptions } from "express"

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: config().isProduction,
  sameSite: "lax",
  path: "/",
  domain: config().domain,
}
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: config().isProduction,
  sameSite: "lax",
  path: "/",
  domain: config().domain,
}
