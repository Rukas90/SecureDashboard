import {
  AccessDeniedError,
  AccessForbiddenError,
  ConflictError,
  UnexpectedError,
} from "@shared/errors"
import { AuthErrorCodes } from "@project/shared"

export class AuthInvalidCredentialsError extends AccessDeniedError {
  constructor() {
    super("Invalid credentials", AuthErrorCodes.AUTH_INVALID_CREDENTIALS)
  }
}
export class AuthUnauthenticatedError extends AccessDeniedError {
  constructor() {
    super("Unauthenticated", AuthErrorCodes.AUTH_UNAUTHENTICATED)
  }
}
export class AuthInvalidScopeError extends AccessForbiddenError {
  constructor() {
    super(
      "Session does not include required auth scope.",
      AuthErrorCodes.AUTH_INVALID_SCOPE,
    )
  }
}
export class AuthInvalidLevelError extends AccessForbiddenError {
  constructor() {
    super(
      "Session does not include required auth level.",
      AuthErrorCodes.AUTH_INVALID_LEVEL,
    )
  }
}
export class AuthEmailAlreadyExistError extends ConflictError {
  constructor() {
    super(
      "An account with this email already exists.",
      AuthErrorCodes.AUTH_EMAIL_ALREADY_EXISTS,
    )
  }
}
export class AuthRegistrationFailedError extends UnexpectedError {
  constructor() {
    super(
      "An unexpected error occurred during registration.",
      AuthErrorCodes.AUTH_REGISTRATION_FAILED,
    )
  }
}
export class AuthInvalidSessionError extends AccessForbiddenError {
  constructor() {
    super(
      "An invalid or missing session token.",
      AuthErrorCodes.AUTH_INVALID_SESSION,
    )
  }
}
export class AuthFailedError extends UnexpectedError {
  constructor() {
    super(
      "Authentication has unexpectedly failed to establish.",
      AuthErrorCodes.AUTH_FAILED,
    )
  }
}
