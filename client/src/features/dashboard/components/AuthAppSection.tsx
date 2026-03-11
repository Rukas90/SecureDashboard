import { IconSmartphone, Line } from "@features/shared"
import EnrollmentConfiguredTag from "./EnrollmentConfiguredTag"
import EnrollmentActionButton from "./EnrollmentActionButton"
import { useTranslation } from "react-i18next"
import { TotpService, useMfaEnrollments } from "@features/mfa"
import SettingsContent from "./SettingsContent"
import MfaRevokeForm from "./MfaRevokeCodeForm"
import { useState } from "react"

const AuthAppSection = () => {
  const { t } = useTranslation()
  const { totp, isLoading } = useMfaEnrollments()
  const [isRevoking, setRevoking] = useState(false)

  return (
    <SettingsContent className="xs:p-4 p-3 flex-col gap-4">
      <div className="flex gap-2 items-center w-full">
        <IconSmartphone className="min-w-5 h-5 text-stone-300" />
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex gap-2 xs:items-center items-start xs:flex-row flex-col">
            <EnrollmentConfiguredTag
              showSkeleton={isLoading}
              isConfigured={totp?.configured ?? false}
            />
            <p className="xs:text-sm text-xs text-stone-300">{t("AUTH_APP")}</p>
          </div>
          <EnrollmentActionButton
            setupLink="/totp/setup"
            isConfigured={totp?.configured ?? false}
            showSkeleton={isLoading}
            onRevoke={() => setRevoking(true)}
            isRevoking={isRevoking}
          />
        </div>
      </div>
      {isRevoking && (
        <>
          <Line />
          <MfaRevokeForm
            onSubmit={(code) => TotpService.revoke({ code })}
            onCancel={() => setRevoking(false)}
            onRevoked={() => setRevoking(false)}
          />
        </>
      )}
    </SettingsContent>
  )
}
export default AuthAppSection
