import { useMutation } from "@tanstack/react-query"
import MfaService from "../services/MfaService"
import { ApiResult } from "@src/lib"

const useMfaRecoveryMutation = () => {
  const mutation = useMutation({
    mutationKey: ["recovery", "codes"],
    mutationFn: async () => {
      const result = await MfaService.regenerateRecoveryCodes()
      return ApiResult.unwrap(result)
    },
    gcTime: 0,
  })
  return {
    regenerate: mutation.mutate,
    regenerateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    codes: mutation.data,
  }
}
export default useMfaRecoveryMutation
