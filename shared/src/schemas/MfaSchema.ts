import { z } from "zod"

export const TOTP_CODE_LENGTH = 6 as const
export const totpCodeSchema = z.object({
  code: z.string().length(TOTP_CODE_LENGTH, "Code must be exactly 6 digits"),
})
export type TotpCode = z.infer<typeof totpCodeSchema>
