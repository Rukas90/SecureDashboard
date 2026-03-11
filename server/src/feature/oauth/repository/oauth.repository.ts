import { Prisma } from "@prisma/client"
import { OAuthProvider } from "@project/shared"
import { BaseRepository, TransactionClient } from "@shared/base"

export type OAuthResult<T extends Prisma.OAuthInclude | undefined> =
  Prisma.OAuthGetPayload<{ include: T }> | null

export class OAuthRepository extends BaseRepository {
  async create(
    userId: string,
    provider: OAuthProvider,
    providerId: string,
    username: string | undefined,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.oAuth.create({
          data: {
            user_id: userId,
            provider,
            provider_id: providerId,
            username: username,
          },
          include: {
            user: true,
          },
        }),
      tx,
      "Failed to create new OAuth user.",
    )
  }
  async findByIdAndType<T extends Prisma.OAuthInclude | undefined>(
    providerId: string,
    provider: OAuthProvider,
    include?: T,
    tx?: TransactionClient,
  ) {
    return this.query<OAuthResult<T>>(
      (client) =>
        client.oAuth.findUnique({
          where: {
            provider_provider_id: {
              provider,
              provider_id: providerId,
            },
          },
          include,
        }) as Promise<OAuthResult<T>>,
      tx,
      "Failed to find oauth by id and provider.",
    )
  }
  async updateUsernameById(
    oauthId: string,
    username: string,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.oAuth.update({
          where: {
            id: oauthId,
          },
          data: {
            username,
          },
        }),
      tx,
      "Failed to update oauth by id username.",
    )
  }
  async deleteById(id: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.oAuth.delete({
          where: {
            id,
          },
        }),
      tx,
      "Failed to delete oauth by id.",
    )
  }
}
export type IOAuthRepository = Pick<OAuthRepository, keyof OAuthRepository>
