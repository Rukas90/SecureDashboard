import { ActionText } from "@features/shared"
import type { SudoConfirmAccessMethod } from "@project/shared"
import { useTranslation } from "react-i18next"

interface Props {
  method: SudoConfirmAccessMethod
  onSelect?: (method: SudoConfirmAccessMethod) => void
  disabled?: boolean
}
const METHOD_LABELS: Record<SudoConfirmAccessMethod, string> = {
  totp: "CONFIRM_WITH_TOTP",
  email: "CONFIRM_WITH_EMAIL",
  password: "CONFIRM_WITH_PASSWORD",
}
const ConfirmMethodListItem = ({ method, onSelect, disabled }: Props) => {
  const { t } = useTranslation()

  return (
    <li>
      <ActionText
        disabled={disabled}
        action={() => onSelect?.(method)}
        className="text-xs"
      >
        {t(METHOD_LABELS[method])}
      </ActionText>
    </li>
  )
}
export default ConfirmMethodListItem
