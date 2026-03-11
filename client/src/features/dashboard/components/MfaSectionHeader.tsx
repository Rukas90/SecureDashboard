import { SectionText, TagLabel, useIsCollapsed } from "@features/shared"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"

interface Props {
  isActive: boolean
  showSkeleton?: boolean
}
const MfaSectionHeader = ({ isActive, showSkeleton = false }: Props) => {
  const { t } = useTranslation()
  const isCollapsed = useIsCollapsed()

  return (
    <div className="flex items-start gap-2 justify-between my-auto xs:h-5.5">
      <SectionText>{t(isCollapsed ? "MFA_SHORT" : "MFA")}</SectionText>
      {showSkeleton ? (
        <Skeleton className="min-w-12 h-full -top-0.5" />
      ) : (
        <TagLabel style={isActive ? "green" : "red"}>
          {isActive ? t("ACTIVE") : t("NOT_ACTIVE")}
        </TagLabel>
      )}
    </div>
  )
}
export default MfaSectionHeader
