import { Request, Response, NextFunction } from "express"
import { asyncController } from "../util"
import type z from "zod"

export const createValidateBody = (schema: z.ZodTypeAny) =>
  asyncController(async (req: Request, _: Response, next: NextFunction) => {
    const body = req.body
    const result = await schema.safeParseAsync(body)

    if (result.success) {
      return next()
    }
    return next(result.error)
  })
