import { MfaEnrollment } from "@prisma/client"
import speakeasy, { GeneratedSecret } from "speakeasy"
import { AppConfig, IEnvironment } from "@base/app"
import { CipherGCMOptions, decryptGCM, encryptGCM } from "@shared/security"
import QRCode from "qrcode"
import { Result, TotpData, VoidResult } from "@project/shared"
import {
  DatabaseError,
  UnexpectFailedOperation as UnexpectedFailedOperation,
} from "@shared/errors"
import {
  MfaAlreadyConfiguredError,
  MfaNotFoundError,
  MfaEnrollmentExpiredError,
  MfaCredentialsMissingError,
  MfaVerificationError,
  MfaInvalidCodeError,
  MfaQRCodeGenerateError,
  MfaDecryptionError,
  MfaEnrollmentFetchFailedError,
} from "../error/mfa.error"
import { ILogger } from "@shared/logger"
import { IEnrollmentRepository } from "../repository/enrollments.repository"
import { IUnitOfWork } from "@shared/base"
import { IMfaService } from "./mfa.service"
import { IUserRepository } from "@features/user"
import { IAuthService } from "@features/auth"
import { SessionContext } from "@features/session"

type TotpCredentials = {
  secret_enc: string
}

const SETUP_EXPIRATION_MINUTES = 15

export class TotpService {
  private readonly encryptionOptions: CipherGCMOptions

  constructor(
    private readonly userRepository: IUserRepository,
    private readonly mfaService: IMfaService,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly config: AppConfig,
    private readonly logger: ILogger,
    environment: IEnvironment,
  ) {
    this.encryptionOptions = {
      key: Buffer.from(
        environment.get.TOTP_SECRET_AES_256_MASTER_KEY,
        "base64",
      ),
      algorithm: "aes-256-gcm",
    }
  }
  async getTotpData(
    userId: string,
  ): Promise<
    Result<
      TotpData,
      | MfaEnrollmentFetchFailedError
      | MfaAlreadyConfiguredError
      | MfaDecryptionError
      | MfaQRCodeGenerateError
      | DatabaseError
      | UnexpectedFailedOperation
    >
  > {
    return this.unitOfWork.run(async (tx) => {
      const user = await Result.orThrowAsync(
        this.userRepository.getById(userId, undefined, tx),
      )
      if (!user) {
        throw new MfaEnrollmentFetchFailedError()
      }
      const currentEnrollment = await Result.orThrowAsync(
        this.enrollmentRepository.findAllByUserIdAndMethod(userId, "totp", tx),
      )
      let enrollment: MfaEnrollment | null = currentEnrollment
      const status = this.mfaService.getEnrollmentStatus(enrollment)

      if (status === "CONFIGURED") {
        return Result.error(new MfaAlreadyConfiguredError())
      }
      if (status === "EXPIRED" || status === "INVALID") {
        if (enrollment) {
          await Result.orThrowAsync(
            this.enrollmentRepository.deleteById(enrollment.id, tx),
          )
        }
        enrollment = null
      }
      if (!enrollment) {
        enrollment = await Result.orThrowAsync(
          this.enrollmentRepository.create(
            userId,
            "totp",
            SETUP_EXPIRATION_MINUTES,
            tx,
          ),
        )
      }
      const { credentials, generatedSecret } = await this.getCredentials(
        user.email,
        enrollment,
      )
      let secretKey: string

      if (!!generatedSecret) {
        secretKey = generatedSecret.base32

        await Result.orThrowAsync(
          this.enrollmentRepository.updateCredentials(
            enrollment.id,
            JSON.stringify(credentials),
            tx,
          ),
        )
      } else {
        secretKey = Result.orThrow(this.decryptSecret(credentials.secret_enc))
      }
      const otpAuthUrl =
        generatedSecret?.otpauth_url ??
        this.createOtpAuthUrl(user.email, secretKey)

      const qrCodeURi = await this.generateQRCodeURi(otpAuthUrl)

      if (!qrCodeURi) {
        throw Result.error(new MfaQRCodeGenerateError())
      }
      const data: TotpData = {
        qrCodeURi,
        setupKey: secretKey,
        expiresAt: enrollment.expires_At!,
      }
      return Result.success(data)
    })
  }
  async getCredentials(
    email: string,
    enrollment: MfaEnrollment,
  ): Promise<{
    credentials: TotpCredentials
    generatedSecret: GeneratedSecret | null
  }> {
    if (enrollment.credentials) {
      return {
        credentials: JSON.parse(
          enrollment.credentials.toString(),
        ) as TotpCredentials,
        generatedSecret: null,
      }
    }
    const secret = this.generateSecret(email)
    const encrypted = encryptGCM(secret.base32, this.encryptionOptions)

    if (!encrypted.ok) {
      this.logger.error(encrypted.error)
      throw encrypted.error
    }
    const credentials = {
      secret_enc: encrypted.data,
    }
    return {
      credentials,
      generatedSecret: secret,
    }
  }
  private generateSecret(email: string): GeneratedSecret {
    return speakeasy.generateSecret({
      name: `${this.config.name}: ${email}`,
      length: 32,
    })
  }
  private decryptSecret(
    secretEnrypted: string,
  ): Result<string, MfaDecryptionError> {
    const decrypted = decryptGCM(secretEnrypted, this.encryptionOptions)
    if (!decrypted.ok) {
      return Result.error(new MfaDecryptionError())
    }
    return Result.success(decrypted.data)
  }
  private createOtpAuthUrl(email: string, secretBase32: string) {
    const issuer = this.config.name
    return speakeasy.otpauthURL({
      secret: secretBase32,
      label: issuer,
      issuer: email,
      algorithm: "sha1",
      digits: 6,
      period: 30,
      encoding: "base32",
    })
  }
  private async generateQRCodeURi(otpAuthUrl: string): Promise<string | null> {
    try {
      return await QRCode.toDataURL(otpAuthUrl)
    } catch {
      return null
    }
  }
  async revoke(userId: string, code: string) {
    const validation = await this.verifyTotpCode(userId, code)
    if (!validation.ok) return validation

    return await this.mfaService.revokeEnrollment(userId, "totp")
  }
  async confirm(userId: string, code: string) {
    const validation = await this.verifyTotpCode(userId, code)
    if (!validation.ok) return validation

    return await this.mfaService.configureEnrollment(userId, "totp")
  }
  async verifyTotpCode(
    userId: string,
    code: string,
    options?: { ensureConfigured?: boolean },
  ) {
    let enrollment = await this.enrollmentRepository.findAllByUserIdAndMethod(
      userId,
      "totp",
    )
    if (!enrollment.ok) {
      return enrollment
    }
    if (!enrollment.data) {
      return VoidResult.error(new MfaNotFoundError())
    }
    const status = this.mfaService.getEnrollmentStatus(enrollment.data)

    switch (status) {
      case "AWAITING_VERIFICATION":
      case "CONFIGURED":
        break
      case "EXPIRED":
        return VoidResult.error(new MfaEnrollmentExpiredError())
      case "INVALID":
        return VoidResult.error(new MfaCredentialsMissingError())
      default:
        return VoidResult.error(new MfaVerificationError())
    }
    if (status === "AWAITING_VERIFICATION" && options?.ensureConfigured) {
      return VoidResult.error(new MfaVerificationError())
    }
    const credentials = enrollment.data.credentials

    if (!credentials) {
      return VoidResult.error(new MfaCredentialsMissingError())
    }
    const parsed = JSON.parse(credentials.toString()) as TotpCredentials
    const decrytionResult = this.decryptSecret(parsed.secret_enc)

    if (!decrytionResult.ok) {
      return decrytionResult
    }
    const secretKey = decrytionResult.data

    const verified = speakeasy.totp.verify({
      secret: secretKey,
      encoding: "base32",
      token: code,
      window: 2,
    })
    if (!verified) {
      return VoidResult.error(new MfaInvalidCodeError())
    }
    return VoidResult.ok()
  }
}
export type ITotpService = Pick<TotpService, keyof TotpService>
