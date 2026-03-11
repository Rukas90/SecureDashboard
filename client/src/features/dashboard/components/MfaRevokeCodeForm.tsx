import {
  ErrorBox,
  InputField,
  MiniButton,
  MiniCancelButton,
} from "@features/shared"
import type { ApiResult } from "@src/lib"
import { useQueryClient } from "@tanstack/react-query"
import { useState, type FormEvent } from "react"

interface Props {
  onSubmit: (code: string) => Promise<ApiResult<string>>
  onCancel: () => void
  onRevoked: () => void
}
const MfaRevokeCodeForm = ({ onSubmit, onCancel, onRevoked }: Props) => {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.stopPropagation()
    event.preventDefault()

    const form = new FormData(event.currentTarget)
    const code = form.get("code") as string

    if (!code) {
      setError("Please enter the code.")
      return
    }
    const result = await onSubmit(code)

    if (!result.ok) {
      setError(result.error.detail)
      return
    }
    queryClient.invalidateQueries({
      queryKey: ["security", "mfa-enrollments"],
    })
    onRevoked()
  }
  return (
    <form className="flex w-full flex-col" onSubmit={handleSubmit}>
      <ErrorBox
        isHidden={!error}
        onClose={() => setError(null)}
        visibleClasses="mb-4"
      >
        {error}
      </ErrorBox>
      <div className="flex gap-3 w-full xs:flex-row flex-col">
        <InputField
          id="code"
          name="code"
          type="code"
          extendWidth
          variant="mini"
          expandable={false}
          placeholder="Enter Code"
          hideable
          indicateError={!!error}
        />

        <div className="inline-flex gap-3 xs:h-auto h-9">
          <MiniCancelButton
            type="submit"
            extendWidth
            className=" px-2.5"
            text="Revoke"
          />
          <MiniButton
            type="button"
            extendWidth
            className=" px-2.5"
            text="Cancel"
            action={onCancel}
          />
        </div>
      </div>
    </form>
  )
}
export default MfaRevokeCodeForm
