import { NextFunction, Request, Response } from "express"
import { AuthUnauthenticatedError } from "../error/auth.error"
import { asyncController, AuthSession } from "@shared/util"
import { IJwtService } from "@shared/token"
import { RevocationCache } from "@base/feature/session"
import { ACCESS_TOKEN_COOKIE_NAME } from "../service/cookie.service"

export const createAuthenticateRequest = (
  jwtService: IJwtService,
  revocation: RevocationCache,
) =>
  asyncController(async (req: Request, _: Response, next: NextFunction) => {
    const access = req.cookies?.[ACCESS_TOKEN_COOKIE_NAME]

    if (!access) {
      return next(new AuthUnauthenticatedError())
    }
    const result = await jwtService.validateAccessToken(access)
    if (!result.ok) {
      return next(new AuthUnauthenticatedError())
    }
    const payload = result.data

    if (!payload.sub || !payload.exp) {
      return next(new AuthUnauthenticatedError())
    }
    if (payload.scope.includes("admin:access") && !payload.sid) {
      return next(new AuthUnauthenticatedError())
    }
    if (payload.sid) {
      if (await revocation.isRevoked(payload.sid)) {
        return next(new AuthUnauthenticatedError())
      }
    }
    const auth: AuthSession = {
      sid: payload.sid,
      userId: payload.sub,
      expiresAt: payload.exp,
      claims: {
        email_verified: payload.email_verified,
        scope: payload.scope,
      },
    }
    req.session.auth = auth
    next()
  })
