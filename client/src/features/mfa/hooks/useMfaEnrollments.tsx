import MfaService from "../services/MfaService"
import { useQuery } from "@tanstack/react-query"

const useMfaEnrollments = () => {
  const query = useQuery({
    queryKey: ["security", "mfa-enrollments"],
    queryFn: async () => {
      const res = await MfaService.getEnrollments()
      if (!res.ok) throw res.error
      return res.data
    },
  })
  return {
    ...query,
    enrollments: query.data,
    isMfaActive: !!query.data?.some((e) => e.configured),
    totp: query.data?.find((e) => e.method === "totp"),
    isMfaLoading: query.isLoading,
  }
}
export default useMfaEnrollments
