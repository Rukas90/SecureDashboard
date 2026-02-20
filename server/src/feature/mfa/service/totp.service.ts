import { MfaEnrollment, User } from "@prisma/client"
import mfaService from "./mfa.service"
import speakeasy, { GeneratedSecret } from "speakeasy"
import { config, database, env } from "@base/app"
import { CipherGCMOptions, decryptGCM, encryptGCM } from "@shared/security"
import QRCode from "qrcode"
import { Result, TotpData, VoidResult } from "@project/shared"
import { DatabaseError, DomainError } from "@shared/errors"
import {
  MfaAlreadyConfiguredError,
  MfaNotFoundError,
  MfaEnrollmentExpiredError,
  MfaCredentialsMissingError,
  MfaVerificationError,
  MfaInvalidCodeError,
  MfaQRCodeGenerateError,
  MfaDecryptionError,
} from "../error/mfa.error"
import logger from "@shared/logger"
import enrollmentRepository from "../repository/enrollments.repository"

type TotpCredentials = {
  secret_enc: string
}
const EncryptionOptions: CipherGCMOptions = {
  key: Buffer.from(env.get.TOTP_SECRET_AES_256_MASTER_KEY, "base64"),
  algorithm: "aes-256-gcm",
}

const SETUP_EXPIRATION_MINUTES = 15

const getCredentials = async (
  user: User,
  enrollment: MfaEnrollment,
): Promise<{
  credentials: TotpCredentials
  generatedSecret: GeneratedSecret | null
}> => {
  if (enrollment.credentials) {
    return {
      credentials: JSON.parse(
        enrollment.credentials.toString(),
      ) as TotpCredentials,
      generatedSecret: null,
    }
  }
  const secret = generateSecret(user)
  const encrypted = encryptGCM(secret.base32, EncryptionOptions)

  if (!encrypted.ok) {
    logger.error(encrypted.error)
    throw encrypted.error
  }
  const credentials = {
    secret_enc: encrypted.data,
  }
  await updateCredentials(enrollment.id, credentials)

  return {
    credentials,
    generatedSecret: secret,
  }
}

const updateCredentials = async (
  enrollmentId: string,
  credentials: TotpCredentials,
) => {
  await database.client.mfaEnrollment.update({
    where: {
      id: enrollmentId,
    },
    data: {
      credentials: JSON.stringify(credentials),
    },
  })
}

const decryptSecret = (
  secretEnrypted: string,
): Result<string, MfaDecryptionError> => {
  const decrypted = decryptGCM(secretEnrypted, EncryptionOptions)
  if (!decrypted.ok) {
    return Result.error(new MfaDecryptionError())
  }
  return Result.success(decrypted.data)
}

const createOtpAuthUrl = (user: User, secretBase32: string) => {
  const issuer = config().name
  return speakeasy.otpauthURL({
    secret: secretBase32,
    label: issuer,
    issuer: user.email,
    algorithm: "sha1",
    digits: 6,
    period: 30,
    encoding: "base32",
  })
}

const generateSecret = (user: User): GeneratedSecret => {
  return speakeasy.generateSecret({
    name: `${config().name}: ${user.email}`,
    length: 32,
  })
}
const generateQRCodeURi = async (
  otpAuthUrl: string,
): Promise<string | null> => {
  try {
    return await QRCode.toDataURL(otpAuthUrl)
  } catch {
    return null
  }
}

const totpService = {
  getTotpData: async (
    user: User,
  ): Promise<Result<TotpData, DomainError | DatabaseError>> => {
    const result = await enrollmentRepository.findAllByUserIdAndMethod(
      user.id,
      "totp",
    )

    if (!result.ok) {
      return result
    }
    let enrollment: MfaEnrollment | null = result.data
    const status = mfaService.getEnrollmentStatus(enrollment)

    switch (status) {
      case "CONFIGURED":
        return Result.error(new MfaAlreadyConfiguredError())
      case "EXPIRED":
      case "INVALID":
        if (enrollment) {
          await database.client.mfaEnrollment.delete({
            where: { id: enrollment.id },
          })
        }
        enrollment = null
        break
      case "NULL":
      case "AWAITING_VERIFICATION":
        break
    }
    if (!enrollment) {
      const newEnrollment = await enrollmentRepository.create(
        user.id,
        "totp",
        SETUP_EXPIRATION_MINUTES,
      )
      if (!newEnrollment.ok) {
        return newEnrollment
      }
      enrollment = newEnrollment.data
    }
    const { credentials, generatedSecret } = await getCredentials(
      user,
      enrollment,
    )
    let secretKey: string

    if (generatedSecret) {
      secretKey = generatedSecret.base32
    } else {
      const decrytionResult = decryptSecret(credentials.secret_enc)

      if (!decrytionResult.ok) {
        return decrytionResult
      }
      secretKey = decrytionResult.data
    }
    const otpAuthUrl =
      generatedSecret?.otpauth_url ?? createOtpAuthUrl(user, secretKey)

    const qrCodeURi = await generateQRCodeURi(otpAuthUrl)

    if (!qrCodeURi) {
      return Result.error(new MfaQRCodeGenerateError())
    }
    return Result.success({
      qrCodeURi,
      setupKey: secretKey,
      expiresAt: enrollment.expires_At!,
    })
  },
  verifyTotpCode: async (
    userId: string,
    code: string,
    options?: { ensureConfigured?: boolean },
  ): Promise<VoidResult<DomainError | DatabaseError>> => {
    let enrollment = await enrollmentRepository.findAllByUserIdAndMethod(
      userId,
      "totp",
    )

    if (!enrollment.ok) {
      return enrollment
    }
    if (!enrollment.data) {
      return VoidResult.error(new MfaNotFoundError())
    }
    const status = mfaService.getEnrollmentStatus(enrollment.data)

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
    const decrytionResult = decryptSecret(parsed.secret_enc)

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
  },
}
export default totpService
