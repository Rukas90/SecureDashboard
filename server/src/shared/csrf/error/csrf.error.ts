import { AccessForbiddenError } from "@base/shared/errors"

export class CsrfInvalidError extends AccessForbiddenError {
  constructor() {
    super("Invalid csrf token.", "CSRF_INVALID")
  }
}
