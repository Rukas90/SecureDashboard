import { AppErrorCodes } from "@project/shared"
import { UnexpectedError } from "./system.error"

export class UnexpectFailedOperation extends UnexpectedError {
  constructor(operation?: string) {
    const message = `The executing operation has unexpectedly failed. The operation: ${operation ?? "Unspecified"}.`
    super(message, AppErrorCodes.APP_OPERATION_ERROR)
  }
}
