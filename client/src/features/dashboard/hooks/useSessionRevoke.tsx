import { useMutation, useQueryClient } from "@tanstack/react-query"
import SessionService from "../services/SessionService"

const useSessionRevoke = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationKey: ["session", "revoke"],
    mutationFn: async (sessionId: string) => {
      const res = await SessionService.revokeSession(sessionId)
      if (!res.ok) {
        throw res.error
      }
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "sessions"] })
    },
    retry: false,
  })
  return {
    revoke: mutation.mutate,
    revokeAsync: mutation.mutateAsync,
    isRevoking: mutation.isPending,
  }
}
export default useSessionRevoke
