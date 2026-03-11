import { Request, Response, NextFunction, RequestHandler } from "express"
import { AuthRequest } from "../util"

type SyncFn<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => void

type AsyncFn<TReq extends Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<void>

type ControllerOptions<TAuth extends boolean, TAsync extends boolean> = {
  auth?: TAuth
  async?: TAsync
}

type ResolvedRequest<TAuth extends boolean> = TAuth extends true
  ? AuthRequest
  : Request

type ResolvedFn<
  TAuth extends boolean,
  TAsync extends boolean,
> = TAsync extends false
  ? SyncFn<ResolvedRequest<TAuth>>
  : AsyncFn<ResolvedRequest<TAuth>>

export function createController<
  TAuth extends boolean = false,
  TAsync extends boolean = true,
>(
  fn: ResolvedFn<TAuth, TAsync>,
  options?: ControllerOptions<TAuth, TAsync>,
): RequestHandler {
  const isAuth = options?.auth ?? false
  const isAsync = options?.async ?? true

  return (req: Request, res: Response, next: NextFunction) => {
    const typedReq = isAuth ? (req as AuthRequest) : req

    if (isAsync) {
      Promise.resolve((fn as AsyncFn<Request>)(typedReq, res, next)).catch(next)
    } else {
      try {
        ;(fn as SyncFn<Request>)(typedReq, res, next)
      } catch (error) {
        next(error)
      }
    }
  }
}
