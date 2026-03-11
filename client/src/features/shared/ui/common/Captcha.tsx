import { forwardRef, useImperativeHandle, useRef } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha"

export interface CaptchaHandle {
  reset: () => void
}
interface CaptchaProps {
  onLoaded?: () => void
  setToken: (token: string | null) => void
  onExpired?: () => void
  onError?: (error: string) => void
  validateAutomatically?: boolean
  sitekey?: string
}
const Captcha = forwardRef<CaptchaHandle, CaptchaProps>((props, ref) => {
  const {
    onLoaded,
    setToken,
    onExpired,
    onError,
    validateAutomatically = false,
    sitekey = "11cc2866-44e0-4858-b66e-946c380049ac",
  } = props

  const captchaRef = useRef<HCaptcha>(null)

  useImperativeHandle(ref, () => ({
    reset: () => {
      captchaRef.current?.resetCaptcha()
      setToken(null)
    },
  }))

  const captchaVerify = (token: string, _: string) => {
    setToken(token)
  }
  const captchaExpire = () => {
    setToken(null)
    captchaRef.current?.resetCaptcha()

    if (onExpired) onExpired()
  }
  const captchaLoaded = () => {
    if (onLoaded) onLoaded()

    if (validateAutomatically) {
      captchaRef.current?.execute()
    }
  }
  const captchaError = (error: string) => {
    if (onError) onError(error)
  }
  return (
    <HCaptcha
      theme={"light"}
      sitekey={sitekey}
      onLoad={captchaLoaded}
      onVerify={captchaVerify}
      onExpire={captchaExpire}
      onError={captchaError}
      ref={captchaRef}
    />
  )
})
export default Captcha
