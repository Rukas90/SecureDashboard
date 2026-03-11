import { LoginSchema, VoidResult, type LoginData } from "@project/shared"
import type z from "zod"
import useAuthForm from "./useAuthForm"
import useLogin from "./useLogin"

const useLoginForm = (onError?: (error: string) => void) => {
  const login = useLogin()

  const handleLogin = async (data: LoginData): Promise<VoidResult<string>> => {
    const result = await login(data)
    if (!result.ok) {
      onError?.(result.error.detail)
      return VoidResult.error(result.error.detail)
    }
    return VoidResult.ok()
  }

  const getValidationError = (
    form: FormData,
    validationError: z.ZodSafeParseError<LoginData>,
  ): string => {
    if (!form.get("email") && !form.get("password")) {
      return "Please enter a valid email and password."
    }
    return validationError.error.issues[0].message
  }

  const form = useAuthForm({
    schema: LoginSchema,
    onAuth: handleLogin,
    getValidationError,
  })

  return {
    ...form,
  }
}
export default useLoginForm
