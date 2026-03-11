import { useLogout } from "@src/features/auth"
import { useTranslation } from "react-i18next"
import type { BaseButtonProps } from "./BaseButton"

import clsx from "clsx"
import BaseButton from "./BaseButton"

const LogoutButton = (props: BaseButtonProps) => {
  const { t } = useTranslation()
  const logout = useLogout()

  const handleLogout = async () => {
    await logout()
  }
  return (
    <BaseButton
      text={t("LOGOUT")}
      {...props}
      className={clsx(
        "text-neutral-200 bg-stone-800 transition-colors xs:py-2 py-1 xs:px-6 px-4 xs:text-base text-sm",
        !props.disabled && "hover:bg-stone-700 active:bg-stone-600",
        props.className,
      )}
      action={handleLogout}
    />
  )
}
export default LogoutButton
