import { z } from "zod"

export const verifyCodeSchema = z.object({
  code: z.string(),
})
export type VerifyCode = z.infer<typeof verifyCodeSchema>
