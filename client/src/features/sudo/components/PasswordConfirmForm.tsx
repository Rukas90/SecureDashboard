import { InputField, SubmitButton } from "@features/shared"
import { useState } from "react"
import useConfirmAccessContext from "../hooks/useConfirmAccessContext"

const PasswordConfirmForm = () => {
  const { isProcessing, verifyPassword } = useConfirmAccessContext()
  const [password, setPassword] = useState("")

  return (
    <div>
      <InputField
        name="password"
        id="password"
        hideable
        isHidden
        className=""
        variant="mini"
        placeholder="Enter password"
        expandable={false}
        extendWidth
        pattern="([0-9]{6})|([0-9a-fA-F]{5}-?[0-9a-fA-F]{5})"
        required
        autocomplete="off"
        readonly={isProcessing}
        onValueChanged={setPassword}
      />
      <SubmitButton
        className="xs:text-sm! text-xs! mt-2"
        text="Verify"
        extendWidth
        disabled={isProcessing}
        action={() => verifyPassword(password)}
      />
    </div>
  )
}
export default PasswordConfirmForm
