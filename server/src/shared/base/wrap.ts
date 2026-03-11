import { Result } from "@project/shared"
import { DomainError, UnexpectFailedOperation } from "../errors"

export const wrap = async <T, E extends DomainError>(
  fn: () => Promise<Result<T, E>>,
  operation?: string,
): Promise<Result<T, E | UnexpectFailedOperation>> => {
  try {
    return await fn()
  } catch (err) {
    return Result.error(err as E)
  }
}
