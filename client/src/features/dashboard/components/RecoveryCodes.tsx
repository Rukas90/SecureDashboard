import {
  IconKey,
  TagLabel,
  PlainText,
  MoreInfoMenu,
  DropdownItem,
  DropdownLabel,
} from "@src/features/shared"
import SettingsContent from "./SettingsContent"
import { Link } from "react-router-dom"

const RecoveryCodes = () => {
  return (
    <SettingsContent className="xs:p-4 p-3">
      <div className="inline-flex gap-2 items-center pr-4">
        <IconKey className="text-stone-400 min-w-5 h-5" />
        <div>
          <div className="flex gap-2">
            <p className="xs:text-sm text-xs text-stone-300">Recovery codes</p>
            <TagLabel
              style="green"
              className="xs:-translate-y-px -translate-y-0.75"
            >
              Active
            </TagLabel>
          </div>
          <PlainText className="text-xs! italic mt-1">
            Recovery codes can be used to access your account in the event you
            lose access to your device and cannot receive two-factor
            authentication codes.
          </PlainText>
        </div>
      </div>
      <MoreInfoMenu>
        <Link to={"/settings/auth/recovery-codes"}>
          <DropdownItem content={<DropdownLabel text="Manage" />} />
        </Link>
      </MoreInfoMenu>
    </SettingsContent>
  )
}
export default RecoveryCodes
