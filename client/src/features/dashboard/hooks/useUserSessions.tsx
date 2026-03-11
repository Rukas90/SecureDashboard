import { useQuery } from "@tanstack/react-query"
import UserService from "../services/UserService"
import type { SessionStatus } from "@project/shared"

const STATUS_ORDER: Record<SessionStatus, number> = {
  active: 1,
  expired: 2,
  revoked: 3,
}
const useUserSessions = () => {
  const query = useQuery({
    queryKey: ["user", "sessions"],
    queryFn: async () => {
      const res = await UserService.getSessions()
      if (!res.ok) {
        throw res.error
      }
      return res.data
    },
    select: (data) =>
      [...data].sort((a, b) => {
        if (a.isCurrent) {
          return -1
        }
        if (b.isCurrent) {
          return 1
        }
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
      }),
  })
  return {
    ...query,
    sessions: query.data,
  }
}
export default useUserSessions
