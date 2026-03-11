import { BaseRepository, TransactionClient } from "@shared/base"

export type CreateVerificationInput = {
  userId: string
  eventType: string
  encryptedPayload: string | null
  codeHash: string
  lookupHash: string
  expiresAt: Date
}

export class VerificationRepository extends BaseRepository {
  async getByLookupHash(lookupHash: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.verification.findUnique({
          where: {
            lookup_hash: lookupHash,
          },
        }),
      tx,
      "Failed to find verification by lookup hash.",
    )
  }
  async deleteById(verificationId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.verification.delete({
          where: {
            id: verificationId,
          },
        }),
      tx,
      "Failed to delete verification by id.",
    )
  }
  async create(input: CreateVerificationInput, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.verification.create({
          data: {
            user_id: input.userId,
            event_type: input.eventType,
            payload_encrypted: input.encryptedPayload,
            code_hash: input.codeHash,
            lookup_hash: input.lookupHash,
            expires_at: input.expiresAt,
          },
        }),
      tx,
      "Failed to create new verification.",
    )
  }
}
export type IVerificationRepository = Pick<
  VerificationRepository,
  keyof VerificationRepository
>
