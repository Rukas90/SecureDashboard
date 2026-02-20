import { database, env } from "@base/app"
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

const refreshService = {
  constants: {
    REFRESH_TOKEN_EXPIRATION_MS: ms("30d"),
  },
  generateRefreshToken: async (
    user: User,
    familyId: string | null,
  ): Promise<{
    refreshToken: string
    expirationDate: Date
  }> => {
    const token = createToken()
    const tokenHash = await hashing.argon2.hash(token)
    const lookupHash = await refreshService.generateLookupHash(token)
    const expirationDate = new Date(
      Date.now() + refreshService.constants.REFRESH_TOKEN_EXPIRATION_MS,
    )

    await database.client.refreshToken.create({
      data: {
        token_hash: tokenHash,
        lookup_hash: lookupHash,
        family_id: familyId ?? refreshService.generateRefreshFamilyId(),
        user_id: user.id,
        expires_at: expirationDate,
        revoked: false,
      },
    })
    return {
      refreshToken: token,
      expirationDate,
    }
  },
  generateRefreshFamilyId: () => crypto.randomUUID(),

  generateLookupHash: async (token: string): Promise<string> => {
    return await hashing.hmac.hash(token, env.get.REFRESH_TOKEN_LOOKUP_SECRET)
  },
  validateRefreshToken: async (
    token?: string,
  ): Promise<Result<RefreshToken & { user: User }, RefreshTokenError>> => {
    if (!token) {
      return Result.error(new RefreshTokenInvalidError())
    }
    const result = await refreshService.findRefreshToken(token)

    if (!result.ok) {
      return Result.error(new RefreshTokenInvalidError())
    }
    const refreshToken = result.data

    if (refreshToken.revoked) {
      await refreshService.revokeTokenFamily(refreshToken.family_id)
      return Result.error(new RefreshTokenReusedError())
    }
    if (new Date() > refreshToken.expires_at) {
      return Result.error(new RefreshTokenExpiredError())
    }
    const comparison = await hashing.argon2.compare(
      token,
      refreshToken.token_hash,
    )
    if (!comparison) {
      return Result.error(new RefreshTokenInvalidError())
    }
    return Result.success(refreshToken)
  },
  findRefreshToken: async (
    token: string,
  ): Promise<
    Result<RefreshToken & { user: User }, RefreshTokenNotFoundError>
  > => {
    const lookupHash = await refreshService.generateLookupHash(token)
    const refreshToken = await database.client.refreshToken.findUnique({
      where: {
        lookup_hash: lookupHash,
      },
      include: {
        user: true,
      },
    })

    if (refreshToken) {
      return Result.success(refreshToken)
    }
    return Result.error(new RefreshTokenNotFoundError())
  },
  revokeTokenFamily: async (familyId: string) => {
    await database.client.refreshToken.updateMany({
      where: { family_id: familyId },
      data: { revoked: true, revoked_at: new Date() },
    })
  },
  revokeRefreshToken: async (lookupHash: string): Promise<void> => {
    await database.client.refreshToken.updateMany({
      where: {
        lookup_hash: lookupHash,
      },
      data: {
        revoked: true,
        revoked_at: new Date(),
      },
    })
  },
  revokeUserRefreshTokens: async (userId: string): Promise<void> => {
    await database.client.refreshToken.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        revoked: true,
        revoked_at: new Date(),
      },
    })
  },
}

const createToken = (): string => {
  return crypto.randomBytes(40).toString("hex")
}

export default refreshService
