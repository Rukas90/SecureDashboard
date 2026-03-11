import { Prisma } from "@prisma/client"
import { BaseRepository, TransactionClient } from "../base"

export type RefreshTokenResult<
  T extends Prisma.RefreshTokenInclude | undefined,
> = Prisma.RefreshTokenGetPayload<{ include: T }> | null

export class RefreshRepository extends BaseRepository {
  async create(
    tokenHash: string,
    lookupHash: string,
    familyId: string,
    userId: string,
    expirationDate: Date,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.refreshToken.create({
          data: {
            token_hash: tokenHash,
            lookup_hash: lookupHash,
            family_id: familyId,
            user_id: userId,
            expires_at: expirationDate,
            revoked: false,
          },
        }),
      tx,
      "Failed to create new refresh token.",
    )
  }
  async findByLookupHash<T extends Prisma.RefreshTokenInclude | undefined>(
    lookupHash: string,
    include?: T,
    tx?: TransactionClient,
  ) {
    return this.query<RefreshTokenResult<T>>(
      (client) =>
        client.refreshToken.findUnique({
          where: {
            lookup_hash: lookupHash,
          },
          include,
        }) as Promise<RefreshTokenResult<T>>,
      tx,
      "Failed to find refresh token by lookup hash.",
    )
  }
  async revokeFamily(familyId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.refreshToken.updateMany({
          where: { family_id: familyId },
          data: { revoked: true, revoked_at: new Date() },
        }),
      tx,
      "Failed to revoke refresh token family.",
    )
  }
  async revokeByLookupHash(lookupHash: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.refreshToken.updateMany({
          where: {
            lookup_hash: lookupHash,
          },
          data: {
            revoked: true,
            revoked_at: new Date(),
          },
        }),
      tx,
      "Failed to revoke refresh token by lookup hash.",
    )
  }
  async revokeByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.refreshToken.updateMany({
          where: {
            user_id: userId,
          },
          data: {
            revoked: true,
            revoked_at: new Date(),
          },
        }),
      tx,
      "Failed to revoke refresh token by user id.",
    )
  }
}

export type IRefreshRepository = Pick<
  RefreshRepository,
  | "create"
  | "findByLookupHash"
  | "revokeFamily"
  | "revokeByLookupHash"
  | "revokeByUserId"
>
