import { ContentContainer, NavBar } from "@features/shared"
import ConfirmAccessForm from "../components/SudoConfirmAccess"
import { LanguagePicker } from "@features/localization"
import { useTranslation } from "react-i18next"

const ConfirmAccessView = () => {
  const { t } = useTranslation()
  return (
    <ContentContainer className="flex flex-col h-full">
      <NavBar />
      <div className="flex flex-col items-center justify-center h-full w-82 max-w-full mx-auto px-2">
        <ConfirmAccessForm className="w-full"></ConfirmAccessForm>
        <p className="mt-4 text-xs! text-center">
          <span className="text-stone-400">{t("SUDO_VERIFY_IDENTITY")}</span>
          <br />
          <br />
          <span className="text-stone-500">{t("SUDO_TIP_MESSAGE")}</span>
        </p>
      </div>
      <div className="absolute flex flex-col items-center bottom-6 left-1/2 -translate-x-1/2">
        <LanguagePicker />
      </div>
    </ContentContainer>
  )
}
export default ConfirmAccessView
