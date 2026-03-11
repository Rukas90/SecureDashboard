import { Result, VoidResult } from "@project/shared"
import {
  CipherGCMOptions,
  decryptGCM,
  encryptGCM,
  hashing,
} from "@shared/security"
import ms from "ms"
import {
  VerificationDispatchFailure,
  VerificationInvalidCode,
  VerificationFailed,
  VerificationFailedToEstablish,
} from "../error/verification.error"
import { Verification } from "@prisma/client"
import { generateReadableCode, generateTokenCode } from "../util/code.util"
import { IMailerService, MailOptions } from "@shared/mailer"
import { IUnitOfWork } from "@shared/base"
import {
  CreateVerificationInput,
  IVerificationRepository,
} from "../repository/verification.repository"
import { AppConfig, IEnvironment } from "@base/app"
import { DatabaseError, DomainError } from "@shared/errors"
import { IEventRegistry } from "../event/event.registry"
import { EventContext } from "../event/event.context"
import { VerificationEventData, VerificationEventJob } from "../event/event.job"

export type VerificationOptions = {
  code?: VerificationCode
}
export type VerificationCode = {
  length?: number
  pattern?: string
}
export type VerificationMailOptions = {
  recipient: string
  subject: string
}

// TODO: Switch from storing verification in the DB to Redis

export const DEFAULT_MANUAL_CODE_LENGTH = 6
export const DEFAULT_TOKEN_CODE_LENGTH = 32

export const DEFAULT_CODE_EXPIRATION_MS = ms("15m")

export const DEFAULT_CODE_PATTERN = "346789ACDEFGHJKLMNPQRTUVWXY"
export const NUMERIC_CODE_PATTERN = "0123456789"

export type VerificationType = "code" | "token"

export class VerificationService {
  private readonly secret: string
  private readonly encryptionOptions: CipherGCMOptions
  private readonly originApi: string

  constructor(
    private readonly mailerService: IMailerService,
    private readonly verificationRepository: IVerificationRepository,
    private readonly eventRegistry: IEventRegistry,
    private readonly unitOfWork: IUnitOfWork,
    environment: IEnvironment,
    config: AppConfig,
  ) {
    this.secret = environment.get.VERIFICATION_LOOKUP_SECRET
    this.encryptionOptions = {
      key: Buffer.from(
        environment.get.PAYLOAD_SECRET_AES_256_MASTER_KEY,
        "hex",
      ),
      algorithm: "aes-256-gcm",
    }
    this.originApi = config.origin.api
  }

  async establishVerificationJob<TPayload>(
    job: VerificationEventJob<TPayload>,
  ) {
    let func: Promise<Result<Verification, DomainError>>

    switch (job.data.type) {
      case "code":
        func = this.establishCodeVerification(job)
        break
      case "token":
        func = this.establishTokenVerification(job)
        break
      default:
        return Result.error(new VerificationFailedToEstablish("Unknown type"))
    }
    return await func
  }
  private async establishCodeVerification<TPayload>(
    job: VerificationEventJob<TPayload>,
  ) {
    const code = generateReadableCode(
      job.data.options?.code?.length ?? DEFAULT_MANUAL_CODE_LENGTH,
      job.data.options?.code?.pattern ?? DEFAULT_CODE_PATTERN,
    )
    const verification = await this.createVerification(
      code,
      job.event,
      job.data,
      `Verification code is: ${code}`,
    )

    if (!verification.ok) return verification

    const mail = await this.sendVerificationEmail(
      `Verification code is: ${code}`,
      job.data.mailOptions,
    )
    if (!mail.ok) return mail

    return Result.success(verification.data)
  }
  private async establishTokenVerification<TPayload>(
    job: VerificationEventJob<TPayload>,
  ) {
    const token = generateTokenCode(
      job.data.options?.code?.length ?? DEFAULT_TOKEN_CODE_LENGTH,
    )
    const verification = await this.createVerification(
      token,
      job.event,
      job.data,
      this.createVerificationLink(token),
    )

    if (!verification.ok) return verification

    return Result.success(verification.data)
  }
  private async createVerification<TPayload>(
    code: string,
    event: string,
    data: VerificationEventData<TPayload>,
    mailMessage: string,
  ) {
    return this.unitOfWork.run(async (tx) => {
      let payloadEncypted: string | null = null

      if (data.payload) {
        payloadEncypted = Result.orThrow(
          encryptGCM(JSON.stringify(data.payload), this.encryptionOptions),
        )
      }
      const codeHash = await hashing.argon2.hash(code)
      const lookupHash = await this.createLookupHash(code)
      const expiresAt = new Date(
        Date.now() + (data.expiresMs ?? DEFAULT_CODE_EXPIRATION_MS),
      )
      const input: CreateVerificationInput = {
        userId: data.userId,
        eventType: event,
        encryptedPayload: payloadEncypted,
        codeHash,
        lookupHash,
        expiresAt,
      }
      const verification = await Result.orThrowAsync(
        this.verificationRepository.create(input, tx),
      )
      await Result.orThrowAsync(
        this.sendVerificationEmail(mailMessage, data.mailOptions),
      )
      return Result.success(verification)
    })
  }

  private async sendVerificationEmail(
    text: string,
    options: VerificationMailOptions,
  ) {
    const mailOptions = {
      recipient: options.recipient,
      subject: options.subject,
      text,
      html: `<p>${text}</p>`,
    } satisfies MailOptions
    return await this.mailerService.send(mailOptions)
  }

  async verifyVerification(
    code: string,
  ): Promise<
    VoidResult<
      | VerificationInvalidCode
      | VerificationDispatchFailure
      | VerificationFailed
      | DatabaseError
    >
  > {
    return this.unitOfWork.run(async (tx) => {
      const lookupHash = await this.createLookupHash(code)

      const verification = await Result.valueAsync(
        this.verificationRepository.getByLookupHash(lookupHash, tx),
      )
      if (!verification) {
        return VoidResult.error(new VerificationFailed())
      }
      if (verification.expires_at < new Date()) {
        await Result.orThrowAsync(
          this.verificationRepository.deleteById(verification.id, tx),
        )
        return VoidResult.error(new VerificationFailed())
      }
      await Result.orThrowAsync(this.validateCode(verification.code_hash, code))
      await Result.orThrowAsync(
        this.verificationRepository.deleteById(verification.id, tx),
      )
      await Result.orThrowAsync(
        this.handleEvent(verification.user_id, verification),
      )
      return VoidResult.ok()
    })
  }
  private async validateCode(
    codeHash: string,
    code: string,
  ): Promise<VoidResult<VerificationInvalidCode>> {
    const isValid = await hashing.argon2.compare(code, codeHash)
    if (!isValid) {
      return VoidResult.error(new VerificationInvalidCode())
    }
    return VoidResult.ok()
  }
  private async handleEvent(
    userId: string,
    verification: Verification,
  ): Promise<VoidResult<VerificationDispatchFailure>> {
    let payload = undefined

    if (!!verification.payload_encrypted) {
      const decryption = decryptGCM(
        verification.payload_encrypted,
        this.encryptionOptions,
      )
      if (decryption.ok) {
        payload = JSON.parse(decryption.data)
      } else {
        return VoidResult.error(new VerificationDispatchFailure())
      }
    }
    const event = this.eventRegistry.get(verification.event_type)

    if (!!event) {
      const context: EventContext<unknown> = {
        userId,
        verificationId: verification.id,
        createdAt: verification.created_at,
        payload,
      }
      await event.resolve(context)
    }
    return VoidResult.ok()
  }
  private async createLookupHash(code: string) {
    return await hashing.hmac.hash(code, this.secret)
  }
  private createVerificationLink(token: string): string {
    const url = new URL("/v1/verify/token", this.originApi)
    url.searchParams.set("token", token)

    return url.toString()
  }
}
export type IVerificationService = Pick<
  VerificationService,
  "establishVerificationJob" | "verifyVerification"
>
