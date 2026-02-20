import { config, env } from "@base/app"
import * as express from "express"
import { type Response } from "express-serve-static-core"
import {
  ProblemDetails,
  SuccessResponse,
  SuccessCode,
  AuthResponseDto,
} from "@project/shared"
import superjson from "superjson"

export const extendResponse = () => {
  express.response.ok = function <T>(
    data: T,
    statusCode: SuccessCode = 200,
  ): express.Response {
    const response: SuccessResponse<T> = {
      status: "success",
      data: data,
    }
    return (this as Response)
      .status(statusCode)
      .send(superjson.stringify(response))
  }
  express.response.auth = function (data: AuthResponseDto): express.Response {
    const response: SuccessResponse<AuthResponseDto> = {
      status: "success",
      data,
    }
    return (this as Response).status(200).send(superjson.stringify(response))
  }
  express.response.problem = function (
    details: ProblemDetails,
  ): express.Response {
    return (this as Response)
      .status(details.status)
      .type("application/problem+json")
      .json({
        type: `urn:${env.get("APP_NAME")}:problem:${details.type}`,
        title: details.title,
        status: details.status,
        detail: details.detail,
        code: details.code,
        instance: details.instance,
        ...(config().isDevelopment && { stack: details.stack }),
        extensions: details.extensions,
      })
  }
}
