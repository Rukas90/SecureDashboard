import { useTranslation } from "react-i18next"
import PlainButton from "./PlainButton"
import { IconGoogle } from "../icons"
import { API_URL } from "@src/lib"

const GoogleButton = () => {
  const { t } = useTranslation()

  return (
    <PlainButton
      icon={<IconGoogle className="w-5 mr-2" />}
      text={t("CONTINUE_WITH_GOOGLE")}
      extendWidth
      className="text-neutral-900 bg-stone-100"
      action={() => {
        window.location.href = new URL("/v1/oauth/google", API_URL).href
      }}
    />
  )
}
export default GoogleButton
