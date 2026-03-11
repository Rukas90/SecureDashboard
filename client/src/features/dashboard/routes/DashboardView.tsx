import { ContentContainer, DividerLabel, NavBar } from "@features/shared"
import SettingsNav from "../components/SettingsNav"
import { Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

const DashboardView = () => {
  const { t } = useTranslation()
  return (
    <ContentContainer className="mb-8">
      <NavBar />
      <DividerLabel className="w-full text-stone-400 text-lg font-medium xs:mt-auto mt-2">
        {t("SETTINGS")}
      </DividerLabel>
      <SettingsNav />
      <Outlet />
    </ContentContainer>
  )
}
export default DashboardView
