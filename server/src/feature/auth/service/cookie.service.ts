import { CookieOptions, Response } from "express"
import { EstablishedAuthSession } from "./auth.service"
import { AppConfig } from "@base/app"

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken"
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken"

export class AuthCookieService {
  private readonly accessTokenCookieOptions: CookieOptions
  private readonly refreshTokenCookieOptions: CookieOptions

  constructor(config: AppConfig) {
    this.accessTokenCookieOptions = {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      domain: config.domain,
    }
    this.refreshTokenCookieOptions = {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      domain: config.domain,
    }
  }
  setAccessTokenCookie(res: Response, accessToken: string, expiration: number) {
    this.clearAccessTokenCookie(res)
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
      ...this.accessTokenCookieOptions,
      maxAge: expiration,
    })
  }
  setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    expiration: number,
  ) {
    this.clearRefreshTokenCookie(res)
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      ...this.refreshTokenCookieOptions,
      maxAge: expiration,
    })
  }

  clearAuthTokenCookies(res: Response) {
    this.clearAccessTokenCookie(res)
    this.clearRefreshTokenCookie(res)
  }

  clearAccessTokenCookie(res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, this.accessTokenCookieOptions)
  }
  clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, this.refreshTokenCookieOptions)
  }
  setAuthSessionCookies(res: Response, session: EstablishedAuthSession) {
    this.setAccessTokenCookie(
      res,
      session.accessToken,
      session.authUser.expiresAt,
    )

    if (session.type === "full") {
      this.setRefreshTokenCookie(
        res,
        session.refreshToken,
        session.refreshExpireMs,
      )
    }
  }
}
