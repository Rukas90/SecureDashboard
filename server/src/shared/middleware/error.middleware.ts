import { domainErrorToProblemDetails, DomainError } from "@shared/errors"
import { AppConfig } from "@base/app"
import { NextFunction, Request, RequestHandler, Response } from "express"
import { ProblemDetails } from "@project/shared"
import { ZodError } from "zod"
import { ILogger } from "../logger"

const INTERNAL_ERROR_DETAILS = (
  type: string,
  request: Request,
): ProblemDetails => {
  return {
    status: 500,
    type: type,
    title: "Internal Error",
    detail: "Unexpected internal error occured",
    code: "INTERNAL_ERROR",
    instance: request.originalUrl,
  }
}
export const createEndpointErrorHandler =
  (config: AppConfig, logger: ILogger) =>
  (
    error: Error | unknown,
    request: Request,
    response: Response,
    _: NextFunction,
  ) => {
    if (!(error instanceof Error)) {
      return response.problem(INTERNAL_ERROR_DETAILS("unknown", request))
    }
    if (error instanceof DomainError) {
      return response.problem(
        domainErrorToProblemDetails(
          error,
          config.isDevelopment,
          request.originalUrl,
        ),
      )
    }
    if (error instanceof ZodError) {
      // TODO: REMOVE THIS AND HANDLE ZOD ERRORS OUTSIDE
      return response.problem({
        status: 400,
        type: "validation-error",
        title: "Validation Error",
        detail: error.issues[0].message,
        code: "VALIDATION_ERROR",
        instance: request.originalUrl,
      })
    }
    logger.error("Unexpected error", error)

    return response.problem({
      ...INTERNAL_ERROR_DETAILS("internal-error", request),
      ...(config.isDevelopment && { stack: error.stack }),
    })
  }
