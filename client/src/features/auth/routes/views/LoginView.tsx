import {
  Captcha,
  DividerLabel,
  TitleText,
  LinkText,
  type CaptchaHandle,
} from "@features/shared"
import { useTranslation } from "react-i18next"
import AuthView from "./AuthView"
import { LoginForm } from "../../components"
import SocialLoginButtons from "../../components/SocialLoginButtons"
import { useLoginForm } from "../../hooks"
import { useRef } from "react"

const LoginView = () => {
  const { t } = useTranslation()
  const captchaRef = useRef<CaptchaHandle>(null)
  const form = useLoginForm((_) => captchaRef.current?.reset())

  return (
    <AuthView error={form.error}>
      <TitleText>{t("LOGIN")}</TitleText>
      <p className="text-stone-400">
        Don't have an account?{" "}
        <LinkText to="/register">{t("REGISTER")}</LinkText>
      </p>
      <SocialLoginButtons />
      <DividerLabel className="py-4 text-stone-400">{t("OR")}</DividerLabel>
      <LoginForm onSubmit={form.onSubmit} fieldErrors={form.fieldErrors} />
      <Captcha setToken={form.setCaptchaToken} ref={captchaRef} />
    </AuthView>
  )
}
export default LoginView
