import {
  AccessForbiddenError,
  InvalidOperationError,
  ResourceMissingError,
} from "@shared/errors"
import { SessionErrorCodes } from "@project/shared"

export class SessionNotFoundError extends ResourceMissingError {
  constructor() {
    super("Session is not found.", SessionErrorCodes.SESSION_NOT_FOUND)
  }
}
export class SessionCannotRevokeCurrentError extends InvalidOperationError {
  constructor() {
    super(
      "Cannot revoke own current session.",
      SessionErrorCodes.SESSION_CANNOT_REVOKE_CURRENT,
    )
  }
}
export class SessionRevokeForeignSessionError extends AccessForbiddenError {
  constructor() {
    super(
      "Cannot revoke foreign session.",
      SessionErrorCodes.SESSION_REVOKE_FOREIGN,
    )
  }
}
