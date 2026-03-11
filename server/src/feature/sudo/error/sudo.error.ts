import { SudoErrorCodes } from "@project/shared"
import { AccessForbiddenError } from "@shared/errors"

export class SudoExpiredError extends AccessForbiddenError {
  constructor() {
    super(
      "Sudo expired. Requires confirmation of access.",
      SudoErrorCodes.SUDO_EXPIRED_ERROR,
    )
  }
}
