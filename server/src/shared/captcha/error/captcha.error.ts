import { UnexpectedError, ValidationError } from "@shared/errors"
import { CaptchaErrorCodes } from "@project/shared"

export class CaptchaInvalidTokenError extends ValidationError {
  constructor() {
    super(
      "Captcha token is invalid, missing or expired.",
      CaptchaErrorCodes.CAPTCHA_INVALID_TOKEN,
    )
  }
}
export class CaptchaFailedToValidateError extends UnexpectedError {
  constructor() {
    super(
      "Failed to validate captcha token.",
      CaptchaErrorCodes.CAPTCHA_FAILED_VALIDATION,
    )
  }
}
