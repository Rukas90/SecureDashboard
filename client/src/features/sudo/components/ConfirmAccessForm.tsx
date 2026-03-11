import type { SudoConfirmAccessMethod } from "@project/shared"
import TotpConfirmForm from "./TotpConfirmForm"
import EmailConfirmForm from "./EmailConfirmForm"
import useConfirmAccessContext from "../hooks/useConfirmAccessContext"
import { ErrorBox } from "@features/shared"
import PasswordConfirmForm from "./PasswordConfirmForm"

interface Props {
  currentMethod: SudoConfirmAccessMethod
}
const ConfirmAccessForm = ({ currentMethod }: Props) => {
  const { error, clearError } = useConfirmAccessContext()

  const renderForm = (method: SudoConfirmAccessMethod) => {
    switch (method) {
      case "totp":
        return <TotpConfirmForm />
      case "email":
        return <EmailConfirmForm />
      case "password":
        return <PasswordConfirmForm />
      default:
        throw new Error(`Unknown confirm method ${method satisfies never}`)
    }
  }
  return (
    <div>
      <div className="p-2">{renderForm(currentMethod)}</div>
      <ErrorBox visibleClasses="mt-4" isHidden={!error} onClose={clearError}>
        {error}
      </ErrorBox>
    </div>
  )
}
export default ConfirmAccessForm
