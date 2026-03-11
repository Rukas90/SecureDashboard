import crypto from "crypto"
import { nanoid } from "nanoid"

export const generateReadableCode = (
  length: number,
  pattern: string,
): string => {
  let code = ""

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, pattern.length)
    code += pattern[randomIndex]
  }
  return code
}
export const generateTokenCode = (length: number): string => {
  return nanoid(length)
}
