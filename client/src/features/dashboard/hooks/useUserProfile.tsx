import { useQuery } from "@tanstack/react-query"
import UserService from "../services/UserService"

const useUserProfile = () => {
  const query = useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const res = await UserService.getProfile()
      if (!res.ok) throw res.error
      return res.data
    },
  })
  return {
    ...query,
    profile: query.data,
    isProfileLoading: query.isLoading,
  }
}
export default useUserProfile
