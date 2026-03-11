import type { ConfirmEnrollmentResponse, TotpData } from "@project/shared"
import type { ApiResult } from "@src/lib"
import { createContext } from "react"

export interface TotpSetupContextData {
  data: TotpData | null
  confirmCode: (code: string) => Promise<ApiResult<ConfirmEnrollmentResponse>>
  error: string | null
  requiredCodeLength: number
  isLoading: boolean
}
export const TotpSetupContext = createContext<TotpSetupContextData | undefined>(
  undefined,
)
