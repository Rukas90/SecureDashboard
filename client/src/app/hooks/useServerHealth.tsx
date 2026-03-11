import { useQuery } from "@tanstack/react-query"
import AppService from "../services/AppService"

const useServerHealth = () => {
  return useQuery({
    queryKey: ["server", "health"],
    queryFn: async () => {
      const res = await AppService.health()
      if (!res.ok) {
        throw res.error
      }

      return res.data
    },
    retry: true,
    retryDelay: 10000,
    staleTime: Infinity,
  })
}
export default useServerHealth
