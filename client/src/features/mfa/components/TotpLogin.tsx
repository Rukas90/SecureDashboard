import { CodeField, PlainText, SubmitButton } from "@features/shared"
import { useRef, type FormEvent } from "react"
import TotpService from "../services/TotpService"
import { totpCodeSchema } from "@project/shared"
import { useOutletContext } from "react-router-dom"
import type { MfaOutletContext } from "../routes/MfaAuthView"
import { useAuthContext } from "@src/features/auth"
import { useTranslation } from "react-i18next"

const TotpLogin = () => {
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement>(null)
  const { setUser } = useAuthContext()
  const { setError } = useOutletContext<MfaOutletContext>()

  const handleVerification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())

    const result = await totpCodeSchema.safeParseAsync(data)

    if (!result.success) {
      return setError(result.error.issues[0].message)
    }
    const response = await TotpService.login(result.data)

    if (!response.ok) {
      return setError(response.error.detail)
    }
    setUser(response.data.user)
    setError(null)
  }
  return (
    <form
      ref={formRef}
      className="flex flex-col gap-6 items-center"
      method="submit"
      onSubmit={handleVerification}
    >
      <PlainText className="text-center">{t("TOTP_MFA_NOTE")}</PlainText>
      <CodeField
        id="verify_code"
        name="code"
        onCompleted={() => formRef.current?.requestSubmit()}
      />
      <SubmitButton type="submit" text={t("VERIFY")} extendWidth />
    </form>
  )
}
export default TotpLogin
