import { NextFunction, Request, Response } from "express"
import { AuthUnauthenticatedError } from "../error/auth.error"
import { asyncRoute, AuthSession } from "@shared/util"
import { jwtService } from "@shared/token"
import { ACCESS_TOKEN_NAME } from "../util/auth.cookie"
import { appRedis } from "@base/redis"

export const authenticateRequest = asyncRoute(
  async (req: Request, _: Response, next: NextFunction) => {
    const access = req.cookies?.[ACCESS_TOKEN_NAME]

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
      const revoked = await appRedis.exists(`revoked_session:${payload.sid}`)

      if (revoked === 1) {
        return next(new AuthUnauthenticatedError())
      }
    }
    const auth: AuthSession = {
      userId: payload.sub,
      expiresAt: payload.exp,
      claims: {
        email_verified: payload.email_verified,
        scope: payload.scope,
      },
    }
    req.session.auth = auth
    next()
  },
)
