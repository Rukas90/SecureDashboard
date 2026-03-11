import { InputField, SubmitButton } from "@features/shared"
import { useState } from "react"
import useConfirmAccessContext from "../hooks/useConfirmAccessContext"
import { useTranslation, Trans } from "react-i18next"

const EmailConfirmForm = () => {
  const { t } = useTranslation()
  const { sentEmail, sendEmailVerification, verifyEmailCode, isProcessing } =
    useConfirmAccessContext()
  const [code, setCode] = useState("")

  if (!sentEmail) {
    return (
      <div>
        <p className="xs:text-sm text-xs text-stone-300 mb-5">
          {t("EMAIL_TRIGGER_MESSAGE")}
        </p>
        <SubmitButton
          extendWidth
          text={t("VERIFY_VIA_EMAIL")}
          action={sendEmailVerification}
          disabled={isProcessing}
        />
      </div>
    )
  }
  return (
    <div>
      <p className="xs:text-sm text-xs text-stone-400 mb-5">
        <Trans
          i18nKey="VERIFICATION_CODE_SENT"
          values={{ email: sentEmail.email }}
          components={{
            email: <span className="text-stone-300!" />,
          }}
        />
      </p>
      <InputField
        name="totp-code"
        id="code"
        hideable
        isHidden
        className=""
        variant="mini"
        placeholder={t("ENTER_CODE")}
        expandable={false}
        extendWidth
        pattern="([0-9]{6})|([0-9a-fA-F]{5}-?[0-9a-fA-F]{5})"
        required
        autocomplete="off"
        onValueChanged={setCode}
        readonly={isProcessing}
      />
      <SubmitButton
        type="submit"
        className="xs:text-sm! text-xs! mt-2"
        text={t("VERIFY")}
        extendWidth
        action={() => verifyEmailCode(code)}
        disabled={isProcessing}
      />
    </div>
  )
}
export default EmailConfirmForm
