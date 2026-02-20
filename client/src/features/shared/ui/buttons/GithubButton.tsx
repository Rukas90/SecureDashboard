import { useTranslation } from "react-i18next"
import PlainButton from "./PlainButton"
import { IconGithub } from "../icons"
import { API_URL } from "@src/lib"

const GithubButton = () => {
  const { t } = useTranslation()

  return (
    <PlainButton
      icon={<IconGithub className="w-5 mr-2" />}
      text={t("CONTINUE_WITH_GITHUB")}
      extendWidth
      className="text-neutral-900 bg-stone-100"
      action={() => {
        window.location.href = new URL("/v1/oauth/github", API_URL).href
      }}
    />
  )
}
export default GithubButton
