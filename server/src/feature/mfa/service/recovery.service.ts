import { hashing } from "@shared/security"
import crypto from "crypto"
import { Result } from "@project/shared"
import { BackupCodeInvalidError } from "../error/backup.error"
import {
  CreateRecoveryCodeInput,
  IRecoveryRepository,
} from "../repository/recovery.repository"
import { IUnitOfWork } from "@shared/base"
import { IEnvironment } from "@base/app"

const BACKUP_CODES_COUNT = 8

export class RecoveryService {
  private lookupSecret: string

  constructor(
    private readonly recoveryRepository: IRecoveryRepository,
    private readonly unitOfWork: IUnitOfWork,
    environment: IEnvironment,
  ) {
    this.lookupSecret = environment.get.BACKUP_CODE_LOOKUP_SECRET
  }

  async createUserCodes(userId: string) {
    return this.unitOfWork.run(async (tx) => {
      await this.recoveryRepository.deleteAllByUserId(userId, tx)

      const codes = this.generateBackupCodes()
      const inputs = await this.mapToCreateCodeInputs(codes)

      await Result.orThrowAsync(
        this.recoveryRepository.createMany(userId, inputs, tx),
      )
      return Result.success(codes)
    }, "createUserCodes")
  }
  async mapToCreateCodeInputs(codes: string[]) {
    const inputs: CreateRecoveryCodeInput[] = await Promise.all(
      codes.map(async (code) => ({
        codeHash: await hashing.argon2.hash(code),
        lookupHash: await this.generateLookupHash(code),
      })),
    )
    return inputs
  }

  async verifyAndUseBackupCode(userId: string, code: string) {
    return await this.unitOfWork.run(async (tx) => {
      const lookupHash = await this.generateLookupHash(code)
      const backupCode = await Result.orThrowAsync(
        this.recoveryRepository.findByLookupHash(userId, lookupHash, tx),
      )
      if (!backupCode) {
        return Result.error(new BackupCodeInvalidError())
      }
      const isValid = await hashing.argon2.compare(code, backupCode.code_hash)

      if (!isValid) {
        return Result.error(new BackupCodeInvalidError())
      }
      await Result.orThrowAsync(
        this.recoveryRepository.markAsUsedById(backupCode.id, tx),
      )
      return Result.success(backupCode)
    }, "verifyAndUseBackupCode")
  }

  async generateLookupHash(code: string) {
    return await hashing.hmac.hash(code, this.lookupSecret)
  }
  generateBackupCodes(count: number = BACKUP_CODES_COUNT): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(5).toString("hex")
      codes.push(code)
    }
    return codes
  }
}
export type IRecoveryService = Pick<RecoveryService, keyof RecoveryService>
