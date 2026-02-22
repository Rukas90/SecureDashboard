import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { JOSEError } from "jose/errors"
import { UnexpectedError } from "@shared/errors"
import { User } from "@prisma/client"
import { AuthUser, Result, Scope } from "@project/shared"
import ms from "ms"
import { config, env } from "@base/app"

const ENCODER = new TextEncoder()
const SECRET = ENCODER.encode(env.get.JWT_SECRET)

export type AccessTokenClaims = {
  scope: Scope[]
  email_verified: boolean
  sid?: string
}

export interface AccessTokenPayload extends JWTPayload, AccessTokenClaims {}

const jwtService = {
  constants: {
    ACCESS_PRE_2FA_TOKEN_EXPIRY_MS: ms("5m"),
    ACCESS_TOKEN_EXPIRY_MS: ms("15m"),
  },
  generatePre2faAccessToken: async (user: User) => {
    return await generateAccessToken(
      user,
      {
        scope: ["mfa:verify"],
        email_verified: user.is_verified,
      },
      jwtService.constants.ACCESS_PRE_2FA_TOKEN_EXPIRY_MS,
    )
  },
  generateFullAccessToken: async (sessionId: string, user: User) => {
    return await generateAccessToken(
      user,
      {
        scope: ["admin:access"],
        email_verified: user.is_verified,
        sid: sessionId,
      },
      jwtService.constants.ACCESS_TOKEN_EXPIRY_MS,
    )
  },
  validateAccessToken: async (
    token: string,
  ): Promise<Result<AccessTokenPayload, Error>> => {
    try {
      const result = await jwtVerify<AccessTokenPayload>(token, SECRET, {
        issuer: config().origin.api,
        audience: config().origin.client,
      })
      return Result.success(result.payload)
    } catch (error) {
      if (error instanceof JOSEError) {
        return Result.error(error)
      }
      return Result.error(
        new UnexpectedError(
          "Unexpected error when verifying access token.",
          "UNEXPECTED_ERROR",
        ),
      )
    }
  },
}

const generateAccessToken = async (
  user: User,
  claims: AccessTokenClaims,
  expirationMs: number,
): Promise<{ accessToken: string; authUser: AuthUser }> => {
  const expiresAtMs = Date.now() + expirationMs

  const accessToken = await new SignJWT(claims)
    .setIssuer(config().origin.api)
    .setAudience(config().origin.client)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAtMs / 1000))
    .setProtectedHeader({ alg: "HS256" })
    .sign(SECRET)

  const authUser: AuthUser = {
    scope: claims.scope,
    expiresAt: expiresAtMs,
  }
  return { accessToken, authUser }
}

export default jwtService
