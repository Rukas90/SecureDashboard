export type Success<T = void> = {
  ok: true
  data: T
}
export type Failure<E> = {
  ok: false
  error: E
}
export type Result<T = void, E = unknown> = Failure<E> | Success<T>

export const Result = {
  success<T>(data: T): Success<T> {
    return {
      ok: true,
      data,
    }
  },
  error<E>(error: E): Failure<E> {
    return {
      ok: false,
      error,
    }
  },
  match<T, E, R>(
    result: Result<T, E>,
    onSuccess: (data: T) => R,
    onFailure: (error: E) => R,
  ): R {
    return result.ok ? onSuccess(result.data) : onFailure(result.error)
  },
  tap<T, E>(
    result: Result<T, E>,
    onSuccess: (data: T) => void,
    onFailure: (error: E) => void,
  ): void {
    return result.ok ? onSuccess(result.data) : onFailure(result.error)
  },
  orThrow<T, E>(result: Result<T, E>, onError?: (err: E) => void): T {
    if (!result.ok) {
      onError?.(result.error)
      throw result.error
    }
    return result.data
  },
  orThrowAsync: async <T, E>(
    promise: Promise<Result<T, E> | (Failure<E> | Success<T>)>,
  ): Promise<T> => {
    const result = await promise
    if (!result.ok) {
      throw result.error
    }
    return result.data
  },
  orErrAsync: async <T, E, F>(
    promise: Promise<Result<T, E>>,
    onError: (err: E) => F,
  ): Promise<Result<T, F>> => {
    const result = await promise
    if (!result.ok) {
      return Result.error(onError(result.error))
    }
    return Result.success(result.data)
  },
  value: <T, E>(result: Result<T, E>): T | null => {
    if (result.ok) {
      return result.data
    }
    return null
  },
  valueAsync: async <T, E>(
    promise: Promise<Result<T, E>>,
  ): Promise<T | null> => {
    const result = await promise

    if (result.ok) {
      return result.data
    }
    return null
  },
  successOrThrowAsync: async <T, E>(
    promise: Promise<Result<T, E>>,
  ): Promise<Success<T>> => {
    const result = await promise
    if (!result.ok) {
      throw result.error
    }
    return Result.success(result.data)
  },
}

export type VoidResult<E = unknown> = Result<void, E>

export const VoidResult = {
  ok: () => Result.success<void>(undefined),
  error: <E>(error: E) => Result.error<E>(error),
}
