import { BaseRepository, TransactionClient } from "@shared/base"

export type CreateRecoveryCodeInput = {
  codeHash: string
  lookupHash: string
}
export class RecoveryRepository extends BaseRepository {
  create(
    userId: string,
    input: CreateRecoveryCodeInput,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.backupCode.create({
          data: {
            user_id: userId,
            code_hash: input.codeHash,
            lookup_hash: input.lookupHash,
          },
        }),
      tx,
      "Failed to create backup code.",
    )
  }
  createMany(
    userId: string,
    codes: CreateRecoveryCodeInput[],
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.backupCode.createMany({
          data: codes.map(({ codeHash, lookupHash }) => ({
            user_id: userId,
            code_hash: codeHash,
            lookup_hash: lookupHash,
          })),
        }),
      tx,
      "Failed to create backup codes.",
    )
  }
  findAllByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.backupCode.findMany({
          where: { user_id: userId },
        }),
      tx,
      "Failed to get user backup codes.",
    )
  }
  findByLookupHash(userId: string, lookupHash: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.backupCode.findUnique({
          where: {
            user_id: userId,
            lookup_hash: lookupHash,
          },
        }),
      tx,
      "Failed to get backup code.",
    )
  }
  deleteAllByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.backupCode
          .deleteMany({
            where: { user_id: userId },
          })
          .then((r) => r.count),
      tx,
      "Failed to delete backup codes.",
    )
  }
  markAsUsedById(id: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.backupCode.update({
          where: { id },
          data: { used_at: new Date() },
        }),
      tx,
      "Failed to mark backup code as used.",
    )
  }
  existsByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.backupCode
          .findFirst({
            where: { user_id: userId },
          })
          .then((res) => !!res),
      tx,
      "Failed to check backup codes existence.",
    )
  }
}
export type IRecoveryRepository = Pick<
  RecoveryRepository,
  keyof RecoveryRepository
>
