import { InvalidOperationError, UnexpectedError } from "@base/shared/errors"

export class VerificationFailedToEstablish extends InvalidOperationError {
  constructor(reason: string) {
    super(
      `Failed to establish new verification. Reason: ${reason}`,
      "VERIFICATION_FAILED_TO_ESTABLISH",
    )
  }
}
export class VerificationInvalidCode extends InvalidOperationError {
  constructor() {
    super("Invalid verification code.", "VERIFICATION_CODE_INVALID")
  }
}
export class VerificationFailed extends InvalidOperationError {
  constructor() {
    super("Verification failed.", "VERIFICATION_NOT_VALID")
  }
}
export class VerificationDispatchFailure extends UnexpectedError {
  constructor() {
    super(
      "Failed to handle the verification dispatch.",
      "VERIFICATION_DISPATCH_FAILURE",
    )
  }
}
