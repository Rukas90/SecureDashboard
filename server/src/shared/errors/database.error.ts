import { AppErrorCodes } from "@project/shared"
import { UnexpectedError } from "./system.error"

export class DatabaseError extends UnexpectedError {
  constructor(operation?: string) {
    const message = operation
      ? `Database operation failed: ${operation}`
      : "Database operation failed"
    super(message, AppErrorCodes.APP_DATABASE_ERROR)
  }
}
export class UniqueConstraintError extends DatabaseError {
  constructor(public readonly field: string) {
    super(`${field} already exists.`)
    this.name = "UniqueConstraintError"
  }
}
