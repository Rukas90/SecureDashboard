import { SudoErrorCodes } from "@project/shared"
import { InvalidOperationError } from "@shared/errors"

export class SudoVerificationError extends InvalidOperationError {
  constructor() {
    super(
      "Sudo verification failed.",
      SudoErrorCodes.SUDO_VERIFICATION_FAILED_ERROR,
    )
  }
}
