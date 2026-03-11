import { FullSizeContainer, Line } from "@features/shared"
import SettingsPanel from "../components/SettingsPanel"
import SettingsSection from "../components/SettingsSection"
import SettingsContent from "../components/SettingsContent"
import AccountPassword from "../components/AccountPassword"
import AccountEmail from "../components/AccountEmail"
import AccountSignInMethods from "../components/AccountSignInMethods"
import { useTranslation } from "react-i18next"
import DeleteAccountButton from "../components/DeleteAccountButton"

const AccountSettings = () => {
  const { t } = useTranslation()
  return (
    <FullSizeContainer className="flex flex-col gap-6 items-start">
      <SettingsPanel>
        <SettingsSection label={t("ACCOUNT")}>
          <SettingsContent className="flex-col">
            <AccountEmail />
            <Line />
            <AccountPassword />
          </SettingsContent>
        </SettingsSection>
        <SettingsSection label={t("SIGN_IN_METHODS")}>
          <SettingsContent className="flex-col">
            <AccountSignInMethods />
          </SettingsContent>
        </SettingsSection>
        <SettingsSection label={t("DANGER_ZONE")}>
          <SettingsContent className="p-4">
            <DeleteAccountButton />
          </SettingsContent>
        </SettingsSection>
      </SettingsPanel>
    </FullSizeContainer>
  )
}
export default AccountSettings
