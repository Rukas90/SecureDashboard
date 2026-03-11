import {
  CancelButton,
  CodeField,
  ErrorBox,
  Line,
  SubmitButton,
} from "@features/shared"
import TotpHelpInfo from "./TotpHelpInfo"
import TotpSetupData from "./TotpSetupData"
import { useState } from "react"
import useTotpSetup from "../hooks/useTotpSetup"
import { useNavigate } from "react-router-dom"

interface Props {
  onConfigured: (backupCodes: string[] | null) => void
}
const TotpSetupContent = ({ onConfigured }: Props) => {
  const { data, confirmCode, error, requiredCodeLength, isLoading } =
    useTotpSetup()
  const [code, setCode] = useState("")
  const navigate = useNavigate()

  const handleConfirm = async (code: string) => {
    const result = await confirmCode(code)

    if (result.ok) {
      onConfigured(result.data.backupCodes)
    }
  }

  return (
    <>
      <TotpSetupData data={data} isLoading={isLoading} />
      <CodeField
        digits={requiredCodeLength}
        placeholder="-"
        onCodeChanged={setCode}
        onCompleted={(code) => handleConfirm(code)}
      />
      <TotpHelpInfo />
      <Line defaultColor={false} className="bg-stone-800 my-2" />
      <div className="flex gap-4 items-center xs:mb-2">
        <CancelButton
          text="Cancel"
          action={() => {
            navigate("/dashboard/security")
          }}
        />
        <SubmitButton
          text="Submit"
          action={() => handleConfirm(code)}
          disabled={code.length !== requiredCodeLength}
        />
      </div>
      <ErrorBox isHidden={!error}>{error}</ErrorBox>
    </>
  )
}
export default TotpSetupContent
