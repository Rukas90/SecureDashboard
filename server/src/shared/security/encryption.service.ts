import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  CipherKey,
  CipherGCMTypes,
} from "crypto"
import { Result } from "@project/shared"

export class EncryptionError extends Error {
  code = "ENCRYPTION_FAILED"
}
export class DecryptionError extends Error {
  code = "DECRYPTION_FAILED"
}

export type CipherGCMOptions = {
  key: CipherKey
  algorithm: CipherGCMTypes
  authTagLength?: number
}

export const encryptGCM = (
  data: string,
  { key, algorithm, authTagLength = 16 }: CipherGCMOptions,
): Result<string, EncryptionError> => {
  try {
    const iv = randomBytes(12)
    const cipher = createCipheriv(algorithm, key, iv, {
      authTagLength,
    })
    const encrypted = Buffer.concat([
      cipher.update(data, "utf8"),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()
    const combined = Buffer.concat([iv, tag, encrypted])

    return Result.success(combined.toString("base64"))
  } catch (error) {
    return Result.error(new EncryptionError())
  }
}
export const decryptGCM = (
  encryptedText: string,
  { key, algorithm, authTagLength = 16 }: CipherGCMOptions,
): Result<string, DecryptionError> => {
  try {
    const combined = Buffer.from(encryptedText, "base64")

    const iv = combined.subarray(0, 12)
    const tag = combined.subarray(12, 12 + authTagLength)
    const encrypted = combined.subarray(12 + authTagLength)

    const decipher = createDecipheriv(algorithm, key, iv, { authTagLength })
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return Result.success(decrypted.toString("utf8"))
  } catch (error) {
    return Result.error(new DecryptionError())
  }
}
