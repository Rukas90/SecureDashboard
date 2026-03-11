import { useState, type ReactNode } from "react"
import { ConfirmAccessContext } from "../contexts/ConfirmAccessContext"
import { useQueryClient } from "@tanstack/react-query"
import { isExpired, VerificationService } from "@src/features/shared"
import type { SudoEmailSent } from "@project/shared"
import ReauthService from "../services/ReauthService"

export const ConfirmAccessProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const queryClient = useQueryClient()
  const [isProcessing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState<SudoEmailSent | null>(null)

  const verifyTotpCode = async (code: string) => {
    setProcessing(true)
    try {
      const result = await ReauthService.reauthWithTotp(code)

      if (!result.ok) {
        setError(result.error.detail)
        return
      }
      refreshSudo()
    } finally {
      setProcessing(false)
    }
  }

  const sendEmailVerification = async () => {
    setProcessing(true)
    try {
      const result = await ReauthService.sendEmailVerification()

      if (!result.ok) {
        setError(result.error.detail)
        return
      }
      setSentEmail(result.data)
    } finally {
      setProcessing(false)
    }
  }
  const verifyEmailCode = async (code: string) => {
    // The expiration is handled in the server side
    // ...however, a quick client side check prevents an unessesary request call
    if (!sentEmail || isExpired(sentEmail.expiresAt)) {
      setError("Verification is no longer valid. Please resend the code.")
      setSentEmail(null)
    }
    setProcessing(true)
    try {
      const result = await VerificationService.verifyCode(code)

      if (!result.ok) {
        setError(result.error.detail)
        return
      }
      refreshSudo()
    } finally {
      setProcessing(false)
    }
  }

  const verifyPassword = async (password: string) => {
    setProcessing(true)
    try {
      const result = await ReauthService.reauthWithPassword(password)

      if (!result.ok) {
        setError(result.error.detail)
        return
      }
      refreshSudo()
    } finally {
      setProcessing(false)
    }
  }

  const refreshSudo = () => {
    queryClient.invalidateQueries({
      queryKey: ["session", "in_sudo"],
    })
  }

  return (
    <ConfirmAccessContext.Provider
      value={{
        isProcessing,
        error,
        clearError: () => setError(null),
        sentEmail,
        sendEmailVerification,
        verifyTotpCode,
        verifyEmailCode,
        verifyPassword,
      }}
    >
      {children}
    </ConfirmAccessContext.Provider>
  )
}
