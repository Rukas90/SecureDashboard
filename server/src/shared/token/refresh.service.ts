import { Result } from "@project/shared"
import { hashing } from "@shared/security"
import { RefreshToken, User } from "@prisma/client"
import crypto from "crypto"
import ms from "ms"
import {
  RefreshTokenError,
  RefreshTokenExpiredError,
  RefreshTokenInvalidError,
  RefreshTokenNotFoundError,
  RefreshTokenReusedError,
} from "./refresh.error"
import { IEnvironment } from "@base/app"
import { IRefreshRepository } from "./refresh.repository"
import { DatabaseError } from "../errors"

export type GeneratedToken = {
  token: string
  expireAt: Date
  expiryMs: number
}

export class RefreshService {
  private tokenLookupSecret: string

  constructor(
    private readonly refreshRepository: IRefreshRepository,
    environment: IEnvironment,
  ) {
    this.tokenLookupSecret = environment.get.REFRESH_TOKEN_LOOKUP_SECRET
  }
  async generateRefreshToken(
    userId: string,
    familyId: string | null,
  ): Promise<GeneratedToken> {
    const token = this.createToken()

    const tokenHash = await hashing.argon2.hash(token)
    const lookupHash = await this.generateLookupHash(token)

    const expiryMs = ms("30d")
    const expireAt = new Date(Date.now() + expiryMs)
    await this.refreshRepository.create(
      tokenHash,
      lookupHash,
      familyId ?? this.createFamilyId(),
      userId,
      expireAt,
    )
    return {
      token,
      expireAt,
      expiryMs,
    }
  }
  async validateRefreshToken(
    token?: string,
  ): Promise<Result<RefreshToken & { user: User }, RefreshTokenError>> {
    if (!token) {
      return Result.error(new RefreshTokenInvalidError())
    }
    const refreshToken = await this.findRefreshToken(token)

    if (!refreshToken.ok) {
      return Result.error(new RefreshTokenInvalidError())
    }
    if (refreshToken.data.revoked) {
      await this.refreshRepository.revokeFamily(refreshToken.data.family_id)
      return Result.error(new RefreshTokenReusedError())
    }
    if (new Date() > refreshToken.data.expires_at) {
      return Result.error(new RefreshTokenExpiredError())
    }
    const comparison = await hashing.argon2.compare(
      token,
      refreshToken.data.token_hash,
    )
    if (!comparison) {
      return Result.error(new RefreshTokenInvalidError())
    }
    return Result.success(refreshToken.data)
  }
  async findRefreshToken(
    token: string,
  ): Promise<
    Result<
      RefreshToken & { user: User },
      RefreshTokenNotFoundError | DatabaseError
    >
  > {
    const lookupHash = await this.generateLookupHash(token)
    const refreshToken = await this.refreshRepository.findByLookupHash(
      lookupHash,
      { user: true },
    )
    if (!refreshToken.ok) return refreshToken
    if (!refreshToken.data) return Result.error(new RefreshTokenNotFoundError())

    return Result.success(refreshToken.data)
  }
  async generateLookupHash(token: string): Promise<string> {
    return await hashing.hmac.hash(token, this.tokenLookupSecret)
  }
  createFamilyId() {
    return crypto.randomUUID()
  }
  private createToken = (): string => {
    return crypto.randomBytes(40).toString("hex")
  }
}
export type IRefreshService = Pick<RefreshService, keyof RefreshService>
