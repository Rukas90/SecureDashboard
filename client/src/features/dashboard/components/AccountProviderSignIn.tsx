import type { OAuthProvider } from "@project/shared"
import {
  capitalize,
  DropdownItem,
  DropdownLabel,
  MiniButton,
  MoreInfoMenu,
  OutlineBoxContainer,
  useIsCollapsed,
} from "@features/shared"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  icon: ReactNode
  provider: OAuthProvider
  username: string
  onDisconnect: (provider: OAuthProvider) => void
  canDisconnect: boolean
}
const AccountProviderSignIn = ({
  icon,
  provider,
  username,
  onDisconnect,
  canDisconnect,
}: Props) => {
  const { t } = useTranslation()
  const isCollapsed = useIsCollapsed()

  return (
    <OutlineBoxContainer>
      <div className="flex justify-between items-center">
        <div className="flex flex-row gap-3 w-full">
          <div className="text-stone-300 w-4.5 my-auto">{icon}</div>
          <div className="w-full">
            <p className="text-stone-300 text-sm">{capitalize(provider)}</p>
            <p className="text-stone-500 xs:text-sm text-xs">{username}</p>
          </div>
        </div>
        {!isCollapsed ? (
          <MiniButton
            text={t("DISCONNECT")}
            action={() => onDisconnect(provider)}
            disabled={!canDisconnect}
          />
        ) : (
          <MoreInfoMenu>
            <DropdownItem
              content={<DropdownLabel text={t("DISCONNECT")} />}
              onSelected={() => onDisconnect(provider)}
              disabled={!canDisconnect}
            />
          </MoreInfoMenu>
        )}
      </div>
    </OutlineBoxContainer>
  )
}
export default AccountProviderSignIn
