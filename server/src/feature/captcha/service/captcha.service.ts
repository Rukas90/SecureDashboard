import { VoidResult } from "@project/shared"
import {
  CaptchaFailedToValidateError,
  CaptchaInvalidTokenError,
} from "../error/captcha.error"
import logger from "@base/shared/logger"
import { env } from "@base/app"

const VERIFY_URL = "https://hcaptcha.com/siteverify"

interface HCaptchaResponse {
  success: boolean
  "error-codes"?: string[]
}
const captchaService = {
  validateToken: async (
    token: string,
    remoteip: string,
  ): Promise<
    VoidResult<CaptchaInvalidTokenError | CaptchaFailedToValidateError>
  > => {
    try {
      const response = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.get.CAPTCHA_SECRET,
          response: token,
          remoteip,
        }),
      })
      const result = (await response.json()) as HCaptchaResponse

      if (result.success) {
        return VoidResult.ok()
      }
      logger.fail("Captcha:Failed", result["error-codes"])
      return VoidResult.error(new CaptchaInvalidTokenError())
    } catch (error) {
      logger.error("Captcha:Error", error)
      return VoidResult.error(new CaptchaFailedToValidateError())
    }
  },
}
export default captchaService
