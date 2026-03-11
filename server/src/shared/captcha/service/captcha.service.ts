import { VoidResult } from "@project/shared"
import {
  CaptchaFailedToValidateError,
  CaptchaInvalidTokenError,
} from "../error/captcha.error"
import { IEnvironment } from "@base/app"
import { ILogger } from "@shared/logger"

const VERIFY_URL = "https://hcaptcha.com/siteverify"

interface HCaptchaResponse {
  success: boolean
  "error-codes"?: string[]
}
export class CaptchaService {
  private secret: string

  constructor(
    environment: IEnvironment,
    private readonly logger: ILogger,
  ) {
    this.secret = environment.get.CAPTCHA_SECRET
  }
  async validateToken(
    token: string,
    remoteip: string,
  ): Promise<
    VoidResult<CaptchaInvalidTokenError | CaptchaFailedToValidateError>
  > {
    try {
      const response = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: this.secret,
          response: token,
          remoteip,
        }),
      })
      const result = (await response.json()) as HCaptchaResponse

      if (result.success) {
        return VoidResult.ok()
      }
      this.logger.fail("Captcha:Failed", result["error-codes"])
      return VoidResult.error(new CaptchaInvalidTokenError())
    } catch (error) {
      this.logger.error("Captcha:Error", error)
      return VoidResult.error(new CaptchaFailedToValidateError())
    }
  }
}
export type ICaptchaService = Pick<CaptchaService, keyof CaptchaService>
