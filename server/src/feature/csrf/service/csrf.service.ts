import { env } from "@base/app"
import crypto from "crypto"

const csrfService = {
  generateCsrfToken: () => {
    const token = crypto.randomBytes(32).toString("hex")
    const signature = crypto
      .createHmac("sha256", env.get.CSRF_SECRET)
      .update(token)
      .digest("hex")
    return `${token}.${signature}`
  },
  verifyCsrfToken: (token: string): boolean => {
    const [value, signature] = token.split(".")

    if (!value || !signature) {
      return false
    }
    const expectedSignature = crypto
      .createHmac("sha256", env.get.CSRF_SECRET)
      .update(value)
      .digest("hex")

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  },
}
export default csrfService
