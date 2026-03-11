import type { SessionStatus } from "@project/shared"
import clsx from "clsx"

const ColorStyles = {
  active: "bg-green-500",
  expired: "bg-red-500",
  revoked: "bg-gray-500",
} satisfies Record<SessionStatus, string>

interface Props extends Pick<React.ComponentProps<"div">, "className"> {
  status: SessionStatus
}
const StatusDot = ({ status, className }: Props) => {
  return (
    <span className={clsx("relative flex size-2", className)}>
      <span
        className={clsx(
          "absolute inline-flex h-full w-full rounded-full",
          status === "active" && "animate-ping",
          ColorStyles[status],
        )}
      />
      <span
        className={clsx(
          "relative inline-flex size-2 rounded-full",
          ColorStyles[status],
        )}
      />
    </span>
  )
}
export default StatusDot
