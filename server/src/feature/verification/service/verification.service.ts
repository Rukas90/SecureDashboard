import { database, env } from "@base/app"
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
  VerificationNotValid,
} from "../error/verification.error"
import {
  DispatchContext,
  DispatchData,
  executeDispatch,
} from "@shared/dispatch"
import { Verification } from "@prisma/client"
import { generateReadableCode, generateTokenCode } from "../util/code.util"
import { Mailer, MailOptions } from "@shared/mailer"
import { createVerificationLink } from "../util/link.util"
import { Prisma } from "@prisma/client"

type TransactionClient = Prisma.TransactionClient

export type VerificationMailOptions = {
  recipient: string
  subject: string
}
export type VerificationData<TPayload> = {
  userId: string
  expiresMs?: number
  mailOptions: VerificationMailOptions
} & DispatchData<TPayload>

const DEFAULT_MANUAL_CODE_LENGTH = 6
const DEFAULT_TOKEN_CODE_LENGTH = 32
const DEFAULT_CODE_EXPIRATION_MS = ms("15m")

const EncryptionOptions: CipherGCMOptions = {
  key: Buffer.from(env.get.PAYLOAD_SECRET_AES_256_MASTER_KEY, "hex"),
  algorithm: "aes-256-gcm",
}

const verificationService = {
  establishCodeVerification: async <TPayload>(
    data: VerificationData<TPayload>,
  ): Promise<Result<Verification, Error>> => {
    return await database.client.$transaction(
      async (client: TransactionClient) => {
        const code = generateReadableCode(DEFAULT_MANUAL_CODE_LENGTH)
        const verification = await establishVerification(code, data, client)

        if (!verification.ok) {
          return verification
        }
        const mail = await sendVerificationEmail(
          `Verification code is: ${code}`,
          data.mailOptions,
        )
        if (!mail.ok) {
          return mail
        }
        return Result.success(verification.data)
      },
    )
  },
  establishTokenVerification: async <TPayload>(
    data: VerificationData<TPayload>,
  ): Promise<Result<Verification, Error>> => {
    return await database.client.$transaction(
      async (client: TransactionClient) => {
        const token = generateTokenCode(DEFAULT_TOKEN_CODE_LENGTH)
        const verification = await establishVerification(token, data, client)

        if (!verification.ok) {
          return verification
        }
        const mail = await sendVerificationEmail(
          createVerificationLink(token),
          data.mailOptions,
        )
        if (!mail.ok) {
          return mail
        }
        return Result.success(verification.data)
      },
    )
  },
  verifyVerification: async (
    code: string,
  ): Promise<
    VoidResult<
      | VerificationNotValid
      | VerificationInvalidCode
      | VerificationDispatchFailure
    >
  > => {
    const verification = await getVerification(code)

    if (!verification) {
      return VoidResult.error(new VerificationNotValid())
    }
    if (verification.expires_at < new Date()) {
      await removeVerification(verification.id)
      return VoidResult.error(new VerificationNotValid())
    }
    const validation = await validateCode(verification.code_hash, code)

    if (!validation.ok) {
      return VoidResult.error(validation.error)
    }
    try {
      const dispatch = await handleDispatch(verification.user_id, verification)

      if (!dispatch.ok) {
        return dispatch
      }
      return VoidResult.ok()
    } finally {
      await removeVerification(verification.id)
    }
  },
}

const establishVerification = async <TPayload>(
  code: string,
  data: VerificationData<TPayload>,
  client?: TransactionClient,
): Promise<Result<Verification, Error>> => {
  let payloadEncypted: string | null = null

  if (data.dispatchPayload) {
    const encryption = encryptGCM(
      JSON.stringify(data.dispatchPayload),
      EncryptionOptions,
    )
    if (encryption.ok) {
      payloadEncypted = encryption.data
    } else {
      return Result.error(encryption.error)
    }
  }
  const verification = await createVerification(
    data.userId,
    data.dispatchName,
    payloadEncypted,
    code,
    data.expiresMs ?? DEFAULT_CODE_EXPIRATION_MS,
    client,
  )
  return Result.success(verification)
}

const sendVerificationEmail = async (
  text: string,
  options: VerificationMailOptions,
) => {
  const mailOptions = {
    recipient: options.recipient,
    subject: options.subject,
    text,
    html: `<p>${text}</p>`,
  } satisfies MailOptions
  return await Mailer.send(mailOptions)
}
const createVerification = async (
  userId: string,
  dispatchType: string,
  encryptedPayload: string | null,
  code: string,
  expiresMs: number,
  client?: TransactionClient,
) => {
  const codeHash = await hashing.argon2.hash(code)
  const lookupHash = await createLookupHash(code)
  const expiryDate = new Date(Date.now() + expiresMs)

  return await (client ?? database.client).verification.create({
    data: {
      user_id: userId,
      dispatch_type: dispatchType,
      payload_encrypted: encryptedPayload,
      code_hash: codeHash,
      lookup_hash: lookupHash,
      expires_at: expiryDate,
    },
  })
}

const validateCode = async (
  codeHash: string,
  code: string,
): Promise<VoidResult<VerificationInvalidCode>> => {
  const isValid = await hashing.argon2.compare(code, codeHash)
  if (!isValid) {
    return VoidResult.error(new VerificationInvalidCode())
  }
  return VoidResult.ok()
}

const handleDispatch = async (
  userId: string,
  verification: Verification,
): Promise<VoidResult<VerificationDispatchFailure>> => {
  const context: DispatchContext = {
    userId,
    verificationId: verification.id,
    createdAt: verification.created_at,
  }
  let payload = undefined

  if (!!verification.payload_encrypted) {
    const decryption = decryptGCM(
      verification.payload_encrypted,
      EncryptionOptions,
    )
    if (decryption.ok) {
      payload = JSON.parse(decryption.data)
    } else {
      return VoidResult.error(new VerificationDispatchFailure())
    }
  }
  await executeDispatch(verification.dispatch_type, context, payload)
  return VoidResult.ok()
}

const getVerification = async (code: string) => {
  const lookupHash = await createLookupHash(code)
  return await database.client.verification.findUnique({
    where: {
      lookup_hash: lookupHash,
    },
  })
}

const createLookupHash = async (code: string) => {
  return await hashing.hmac.hash(code, env.get.VERIFICATION_LOOKUP_SECRET)
}
const removeVerification = async (id: string) => {
  await database.client.verification.delete({
    where: {
      id,
    },
  })
}

export default verificationService
