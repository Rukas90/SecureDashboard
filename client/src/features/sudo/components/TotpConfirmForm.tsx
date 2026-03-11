import { InputField, SubmitButton } from "@features/shared"
import { useState, type FormEvent } from "react"
import useConfirmAccessContext from "../hooks/useConfirmAccessContext"
import { useTranslation } from "react-i18next"

const TotpConfirmForm = () => {
  const { t } = useTranslation()
  const { isProcessing, verifyTotpCode } = useConfirmAccessContext()
  const [code, setCode] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    verifyTotpCode(code)
  }
  return (
    <form onSubmit={handleSubmit}>
      <InputField
        name="code"
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
        readonly={isProcessing}
        onValueChanged={setCode}
      />
      <SubmitButton
        type="submit"
        className="xs:text-sm! text-xs! mt-2"
        text={t("VERIFY")}
        extendWidth
        disabled={isProcessing}
      />
    </form>
  )
}
export default TotpConfirmForm
