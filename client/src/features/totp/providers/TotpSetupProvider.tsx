import { useEffect, useRef, useState } from "react"
import { TotpSetupContext } from "../contexts/TotpSetupContext"
import {
  MfaErrorCodes,
  type ConfirmEnrollmentResponse,
  type TotpData,
} from "@project/shared"
import { useNavigate } from "react-router-dom"
import { TotpService } from "@features/mfa"
import { toast, type ApiResult } from "@src/lib"

const TotpSetupProvider = ({
  children,
}: Pick<React.ComponentProps<"div">, "children">) => {
  const navigate = useNavigate()

  // Maybe convert to useMutation?

  const [data, setData] = useState<TotpData | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const initStarted = useRef(false)

  const REQUIRED_CODE_LENGTH = 6

  useEffect(() => {
    if (initialized || initStarted.current) {
      return
    }
    initStarted.current = true
    TotpService.getInitData()
      .then((res) => {
        if (res.ok) {
          setData(res.data)
        } else {
          if (res.error.code === MfaErrorCodes.MFA_ALREADY_CONFIGURED) {
            navigate("/dashboard/security")
          }
          toast.error(res.error.detail)
          navigate("/dashboard/security")
        }
      })
      .finally(() => setInitialized(true))
  }, [])

  const confirmCode = async (
    code: string,
  ): Promise<ApiResult<ConfirmEnrollmentResponse>> => {
    const res = await TotpService.confirmSetup({
      code,
    })
    setError(null)

    if (!res.ok) {
      setError(res.error.detail)
    }
    return res
  }

  return (
    <TotpSetupContext.Provider
      value={{
        data,
        confirmCode,
        error,
        requiredCodeLength: REQUIRED_CODE_LENGTH,
        isLoading: !initialized,
      }}
    >
      {children}
    </TotpSetupContext.Provider>
  )
}
export default TotpSetupProvider
