import { JWTPayload, SignJWT, jwtVerify } from "jose"
import { JOSEError } from "jose/errors"
import { UnexpectedError } from "@shared/errors"
import { AuthUser, Result, Scope } from "@project/shared"
import ms from "ms"
import { AppConfig, IEnvironment } from "@base/app"

export type AccessTokenClaims = {
  scope: Scope[]
  email_verified: boolean
  sid?: string
}
export interface AccessTokenPayload extends JWTPayload, AccessTokenClaims {}

export const ACCESS_TOKEN_EXPIRY_MS = ms("15m")
export const ACCESS_PRE_MFA_TOKEN_EXPIRY_MS = ms("5m")

export class JwtService {
  secret: Uint8Array<ArrayBufferLike>

  constructor(
    private readonly config: AppConfig,
    environment: IEnvironment,
  ) {
    this.secret = new TextEncoder().encode(environment.get.JWT_SECRET)
  }

  async generatePreMfaAccessToken(userId: string, isVerified: boolean) {
    return this.generateAccessToken(
      userId,
      {
        scope: ["mfa:verify"],
        email_verified: isVerified,
      },
      ACCESS_PRE_MFA_TOKEN_EXPIRY_MS,
    )
  }
  async generateFullAccessToken(
    userId: string,
    isVerified: boolean,
    sessionId: string,
  ) {
    return this.generateAccessToken(
      userId,
      {
        scope: ["admin:access"],
        email_verified: isVerified,
        sid: sessionId,
      },
      ACCESS_TOKEN_EXPIRY_MS,
    )
  }
  private async generateAccessToken(
    userId: string,
    claims: AccessTokenClaims,
    expirationMs: number,
  ) {
    const expiresAtMs = Date.now() + expirationMs

    const accessToken = await new SignJWT(claims)
      .setIssuer(this.config.origin.api)
      .setAudience(this.config.origin.client)
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAtMs / 1000))
      .setProtectedHeader({ alg: "HS256" })
      .sign(this.secret)

    const authUser: AuthUser = {
      scope: claims.scope,
      expiresAt: expiresAtMs,
    }
    return { accessToken, authUser }
  }
  async validateAccessToken(token: string) {
    try {
      const result = await jwtVerify<AccessTokenPayload>(token, this.secret, {
        issuer: this.config.origin.api,
        audience: this.config.origin.client,
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
  }
}
export type IJwtService = Pick<JwtService, keyof JwtService>
