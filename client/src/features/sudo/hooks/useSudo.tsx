import { useQuery } from "@tanstack/react-query"
import SudoService from "../services/SudoService"

const useSudo = () => {
  const query = useQuery<boolean>({
    queryKey: ["session", "in_sudo"],
    queryFn: async () => {
      const res = await SudoService.getInSudo()
      if (!res.ok) throw res.error
      return res.data
    },
    retry: false,
  })
  return {
    inSudo: query.data ?? false,
    ...query,
  }
}
export default useSudo
