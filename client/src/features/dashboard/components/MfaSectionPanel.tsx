import AuthAppSection from "./AuthAppSection"
import SettingsPanel from "./SettingsPanel"
import SettingsSection from "./SettingsSection"
import MfaSectionHeader from "./MfaSectionHeader"
import { useMfaEnrollments } from "@features/mfa"
import RecoveryCodes from "./RecoveryCodes"

const MfaSectionPanel = () => {
  const { isMfaActive, isLoading } = useMfaEnrollments()
  return (
    <SettingsPanel>
      <SettingsSection
        label={
          <MfaSectionHeader isActive={isMfaActive} showSkeleton={isLoading} />
        }
      >
        <AuthAppSection />
      </SettingsSection>
      {isMfaActive && (
        <SettingsSection label="Recovery options">
          <RecoveryCodes />
        </SettingsSection>
      )}
    </SettingsPanel>
  )
}
export default MfaSectionPanel
