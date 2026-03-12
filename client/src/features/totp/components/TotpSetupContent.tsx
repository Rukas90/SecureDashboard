import {
  CancelButton,
  ErrorBox,
  InputField,
  Line,
  SubmitButton,
} from "@features/shared"
import TotpHelpInfo from "./TotpHelpInfo"
import TotpSetupData from "./TotpSetupData"
import { useEffect, useRef, useState, type FormEvent } from "react"
import useTotpSetup from "../hooks/useTotpSetup"
import { useNavigate } from "react-router-dom"
import { NUMERIC_INPUT_PATTERN } from "@src/lib"

interface Props {
  onConfigured: (backupCodes: string[] | null) => void
}
const TotpSetupContent = ({ onConfigured }: Props) => {
  const formRef = useRef<HTMLFormElement | null>(null)
  const {
    data,
    confirmCode,
    error,
    clearError,
    requiredCodeLength,
    isPending,
    initialized,
  } = useTotpSetup()

  const [code, setCode] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    if (code.length === requiredCodeLength && formRef.current) {
      formRef.current.requestSubmit()
    }
  }, [code])

  const handleConfirm = async (e: FormEvent<HTMLFormElement>) => {
    if (isPending || !initialized) {
      return
    }
    e.preventDefault()

    const result = await confirmCode(code)

    if (result.ok) {
      onConfigured(result.data.backupCodes)
    }
  }
  const actionsDisabled = !initialized || isPending

  return (
    <form
      ref={formRef}
      onSubmit={handleConfirm}
      className="flex flex-col items-center gap-2"
    >
      <TotpSetupData data={data} isLoading={!initialized} />
      <InputField
        colors="lighter"
        maxLength={requiredCodeLength}
        placeholder="XXXXXX"
        onValueChanged={setCode}
        variant="mini"
        expandable={false}
        pattern={NUMERIC_INPUT_PATTERN}
        required
        centerText
      />
      <TotpHelpInfo />
      <Line defaultColor={false} className="bg-stone-800 my-2" />
      <div className="flex gap-4 items-center xs:mb-2">
        <CancelButton
          text="Cancel"
          action={() => {
            navigate("/dashboard/security")
          }}
          disabled={actionsDisabled}
        />
        <SubmitButton
          text="Submit"
          type="submit"
          disabled={code.length !== requiredCodeLength || actionsDisabled}
        />
      </div>
      <ErrorBox isHidden={!error} onClose={clearError}>
        {error}
      </ErrorBox>
    </form>
  )
}
export default TotpSetupContent
