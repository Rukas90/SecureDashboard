import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import type z from "zod"
import type { ApiResult } from "@src/lib"

interface Props<TSchema extends z.ZodType> {
  schema: TSchema
  requestFn: (data: z.infer<TSchema>) => Promise<ApiResult<string>>
  onSuccess?: () => void
}
export const usePasswordForm = <TSchema extends z.ZodType>({
  schema,
  requestFn,
  onSuccess,
}: Props<TSchema>) => {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formState, setFormState] = useState<{
    error: string | null
    fieldErrors: Record<string, string>
  }>({ error: null, fieldErrors: {} })

  const clearError = useCallback(() => {
    setFormState({ error: null, fieldErrors: {} })
  }, [setFormState])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIsSubmitting(true)

      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)

      try {
        const validation = await schema.safeParseAsync(data)

        if (!validation.success) {
          const errors: Record<string, string> = {}
          validation.error.issues.forEach((issue) => {
            if (issue.path[0]) {
              errors[issue.path[0].toString()] = issue.message
            }
          })
          setFormState({
            error: validation.error.issues[0].message,
            fieldErrors: errors,
          })
          return
        }
        const response = await requestFn(validation.data)
        let error: string | null = null

        if (!response.ok) {
          error = response.error.detail
        } else {
          queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
          onSuccess?.()
        }
        setFormState({
          error,
          fieldErrors: {},
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [schema, requestFn, onSuccess],
  )

  return {
    handleSubmit,
    isSubmitting,
    error: formState.error,
    fieldErrors: formState.fieldErrors,
    clearError,
  }
}
