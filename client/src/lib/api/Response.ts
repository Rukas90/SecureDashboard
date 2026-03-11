import { type ProblemDetails } from "@project/shared"

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProblemDetails }

export const ApiResult = {
  unwrap<T>(result: ApiResult<T>) {
    if (result.ok) {
      return result.data
    }
    throw result.error
  },
}
