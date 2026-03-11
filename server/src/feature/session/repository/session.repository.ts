import { DatabaseError } from "@shared/errors"
import { UserSession } from "@prisma/client"
import { Result } from "@project/shared"
import { BaseRepository, TransactionClient } from "@shared/base"
import { SessionContext } from "../types/session.types"

export class SessionRepository extends BaseRepository {
  async getByFamilyId(
    familyId: string,
    tx?: TransactionClient,
  ): Promise<Result<UserSession | null, DatabaseError>> {
    return this.query(
      (client) =>
        client.userSession.findUnique({
          where: {
            family_id: familyId,
          },
        }),
      tx,
      "Failed to find user session.",
    )
  }
  async create(
    familyId: string,
    userId: string,
    context: SessionContext | undefined | null,
    expiresAt: Date,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.userSession.create({
          data: {
            family_id: familyId,
            user_id: userId,
            user_agent: context?.userAgent ?? "",
            ip_address: context?.ipAddress ?? "",
            location: context?.location,
            expires_at: expiresAt,
          },
        }),
      tx,
      "Failed to create new user session.",
    )
  }
  async getById(id: string, tx?: TransactionClient) {
    return this.query(
      (client) => client.userSession.findUnique({ where: { id } }),
      tx,
      "Failed to find user session by id.",
    )
  }
  async getAllByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.userSession.findMany({
          where: {
            user_id: userId,
          },
          orderBy: { last_accessed_at: "desc" },
        }),
      tx,
      "Failed to find all user sessions.",
    )
  }
  async updateExpiry(
    familyId: string,
    userId: string,
    expiresAt: Date,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.userSession.update({
          where: {
            family_id: familyId,
            user_id: userId,
          },
          data: {
            last_accessed_at: new Date(),
            expires_at: expiresAt,
          },
        }),
      tx,
      "Failed to update session expiry.",
    )
  }
  async revokeByFamilyId(familyId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.userSession.update({
          where: {
            family_id: familyId,
          },
          data: {
            revoked: true,
          },
        }),
      tx,
      "Failed to revoke family session.",
    )
  }
}
export type ISessionRepository = Pick<
  SessionRepository,
  | "getByFamilyId"
  | "create"
  | "getById"
  | "getAllByUserId"
  | "updateExpiry"
  | "revokeByFamilyId"
>
