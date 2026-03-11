import {
  OutlineBoxContainer,
  IconPassword,
  MiniButton,
  MiniCancelButton,
} from "@features/shared"
import useUserProfile from "../hooks/useUserProfile"
import AccountSettingSkeleton from "./AccountSettingSkeleton"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import PasswordUpdateForm from "./PasswordUpdateForm"
import PasswordSetForm from "./PasswordSetForm"

const AccountPassword = () => {
  const { t } = useTranslation()

  const { profile, isLoading } = useUserProfile()
  const [showForm, setShowForm] = useState(false)

  if (!profile || isLoading) {
    return <AccountSettingSkeleton />
  }
  const hasPassword = profile.hasPassword

  return (
    <OutlineBoxContainer>
      <div className="flex justify-between items-center">
        <div className="flex flex-row gap-3">
          <IconPassword className="text-stone-300 w-4.5" />
          <div>
            <p className="text-stone-300 text-sm">{t("PASSWORD")}</p>
            <p className="text-stone-500 xs:text-sm text-xs">
              {hasPassword ? t("CONFIGURED") : t("NOT_CONFIGURED")}
            </p>
          </div>
        </div>
        {showForm ? (
          <MiniCancelButton
            text={t("CANCEL")}
            action={() => {
              setShowForm(false)
            }}
          />
        ) : (
          <MiniButton
            text={hasPassword ? t("UPDATE") : t("ADD")}
            action={() => {
              setShowForm(true)
            }}
          />
        )}
      </div>
      {}
      {showForm && (
        <div className="w-full bg-[hsl(20,14%,6%)] mt-4 rounded-md p-4">
          {hasPassword ? (
            <PasswordUpdateForm onSuccess={() => setShowForm(false)} />
          ) : (
            <PasswordSetForm onSuccess={() => setShowForm(false)} />
          )}
        </div>
      )}
    </OutlineBoxContainer>
  )
}
export default AccountPassword
