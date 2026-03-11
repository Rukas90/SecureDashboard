import { ConfirmButton, ErrorBox } from "@features/shared"
import clsx from "clsx"
import type { FormEvent } from "react"

export interface PasswordFormProps {
  onSuccess: () => void
}
interface Props extends Pick<React.ComponentProps<"div">, "children"> {
  submitBtnText: string
  onSubmit: (form: FormEvent<HTMLFormElement>) => void
  error: string | null
  disabled: boolean
  clearError: () => void
}
const PasswordForm = ({
  children,
  submitBtnText,
  onSubmit,
  error,
  disabled,
  clearError,
}: Props) => {
  return (
    <form className="flex flex-col" onSubmit={onSubmit}>
      <div className="flex flex-col gap-4 mb-4">{children}</div>
      <ConfirmButton
        type="submit"
        text={submitBtnText}
        className={clsx("w-fit text-sm", error && "mb-4")}
        disabled={disabled}
      />
      <ErrorBox isHidden={!error} onClose={clearError}>
        {error}
      </ErrorBox>
    </form>
  )
}
export default PasswordForm
