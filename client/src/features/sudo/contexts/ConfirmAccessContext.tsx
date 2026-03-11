import type { SudoEmailSent } from "@project/shared"
import { createContext } from "react"

export interface ConfirmAccessState {
  isProcessing: boolean
  error: string | null
  clearError: () => void
  sentEmail: SudoEmailSent | null
  sendEmailVerification: () => void
  verifyTotpCode: (code: string) => void
  verifyEmailCode: (code: string) => void
  verifyPassword: (password: string) => void
}
export const ConfirmAccessContext = createContext<
  ConfirmAccessState | undefined
>(undefined)
