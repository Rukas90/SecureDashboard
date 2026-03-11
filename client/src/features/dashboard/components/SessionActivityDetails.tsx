import {
  MiniCancelButton,
  OutlineBoxContainer,
  PlainText,
  useIsCollapsed,
} from "@features/shared"
import type { SessionDetails } from "@project/shared"
import StatusDot from "./StatusDot"
import { useTranslation } from "react-i18next"
import { formatDate, getLocationDisplay } from "../utils/SessionDisplayUtils"
import DeviceIcon from "./DeviceIcon"
import useSessionRevoke from "../hooks/useSessionRevoke"
import clsx from "clsx"

interface Props {
  session: SessionDetails
}
const SessionActivityDetails = ({ session }: Props) => {
  const { t } = useTranslation()
  const { city, country } = getLocationDisplay(session.location)
  const { revokeAsync, isRevoking } = useSessionRevoke()

  const isCollapsed = useIsCollapsed()

  return (
    <OutlineBoxContainer>
      <div className="flex items-center">
        <DeviceIcon
          className="size-10 text-stone-500"
          device={session.user_agent.device}
        />
        <div className="flex px-6 xs:flex-row flex-col items-start gap-3 w-full">
          <div className="flex flex-col grow">
            <PlainText className={clsx(isCollapsed && "flex flex-col mb-1")}>
              <span className="font-medium">{city}</span>{" "}
              <span className="xs:text-stone-500 text-stone-600">
                {session.ip_address}
              </span>
            </PlainText>
            <div className="flex gap-2">
              <StatusDot className="my-auto" status={session.status} />
              <PlainText className="xs:font-normal font-medium">
                {t(session.status.toUpperCase())}
              </PlainText>
            </div>
            <div className="w-4 h-0.5 my-2 bg-stone-800" />
            <PlainText>
              {session.isCurrent ? (
                t("YOUR_CURRENT_SESSION")
              ) : (
                <span className="xs:block flex flex-col">
                  <span className="xs:font-normal font-medium">
                    {t("LAST_ACCESSED_ON")}:{" "}
                  </span>
                  <span className="xs:text-stone-500 text-stone-600">
                    {formatDate(
                      session.last_accessed_at,
                      isCollapsed ? "minified" : "default",
                    )}
                  </span>
                </span>
              )}
            </PlainText>
            <PlainText className={clsx(isCollapsed && "flex flex-col")}>
              <span className="xs:font-normal font-medium">{t("SEEN_IN")}</span>{" "}
              <span className="xs:text-stone-500 text-stone-600">
                {country}
              </span>
            </PlainText>
          </div>
          {session.status === "active" && !session.isCurrent && (
            <MiniCancelButton
              text={t("REVOKE")}
              action={() => revokeAsync(session.id)}
              disabled={isRevoking}
            />
          )}
        </div>
      </div>
    </OutlineBoxContainer>
  )
}
export default SessionActivityDetails
