import { DomainErrorType } from "./domain.error.type"

export abstract class DomainError extends Error {
  public abstract readonly type: DomainErrorType
  public readonly code: string
  public readonly data?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    options?: { data?: Record<string, unknown> },
  ) {
    super(message)
    this.code = code
    this.data = options?.data
    this.name = new.target.name
  }
}
