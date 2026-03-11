import {
  DropdownItem,
  DropdownLabel,
  MiniButton,
  MoreInfoMenu,
  useIsCollapsed,
} from "@features/shared"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { Link } from "react-router-dom"

interface Props {
  setupLink: string
  isConfigured: boolean
  showSkeleton?: boolean
  disabled?: boolean
  onRevoke?: () => void
  isRevoking?: boolean
}
const EnrollmentActionButton = ({
  setupLink,
  isConfigured,
  showSkeleton = false,
  disabled = false,
  onRevoke,
  isRevoking,
}: Props) => {
  const { t } = useTranslation()
  const isCollapsed = useIsCollapsed()

  if (showSkeleton) {
    return <Skeleton className="min-w-10 h-full -top-0.5" />
  }
  const renderItems = () => {
    if (!isConfigured) {
      return (
        <DropdownItem
          disabled={disabled}
          content={
            <Link to={disabled ? "#" : setupLink}>
              <DropdownLabel text={t("ADD")} />
            </Link>
          }
        />
      )
    }
    return (
      <DropdownItem
        disabled={isRevoking}
        onSelected={onRevoke}
        content={<DropdownLabel text={t("REVOKE")} />}
      />
    )
  }
  const renderMenu = () => {
    return <MoreInfoMenu disabled={disabled}>{renderItems()}</MoreInfoMenu>
  }
  return isCollapsed || isConfigured ? (
    renderMenu()
  ) : (
    <Link to={disabled ? "#" : setupLink}>
      <MiniButton text={t("ADD")} />
    </Link>
  )
}
export default EnrollmentActionButton
