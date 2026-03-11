import clsx from "clsx"
import type React from "react"

type MessageBoxVariant = "default" | "success" | "warning"

interface Props extends Pick<
  React.ComponentProps<"p">,
  "children" | "className"
> {
  label?: string
  variant?: MessageBoxVariant
}

// @tw
interface Styles {
  bg: string
  border: string
  label: string
}

const Styles: Record<MessageBoxVariant, Styles> = {
  default: {
    bg: "bg-[#2e2520]",
    border: "border-[#4b3d35]",
    label: "text-[#dfd2cb]",
  },
  success: {
    bg: "bg-[#222e20]",
    border: "border-[#354b38]",
    label: "text-[#ccdfcb]",
  },
  warning: {
    bg: "bg-[#442818]",
    border: "border-[#643316]",
    label: "text-[#e4c2ae]",
  },
}
const MessageBox = ({
  label,
  variant = "default",
  children,
  className,
}: Props) => {
  const styles = Styles[variant]
  return (
    <p
      className={clsx(
        className,
        "w-full text-center border rounded-sm p-3 xs:text-sm text-xs",
        styles.bg,
        styles.border,
      )}
    >
      {label && (
        <span className="mb-1">
          <span className={clsx("font-semibold", styles.label)}>{label}</span>
          <br />
        </span>
      )}
      <span className="text-stone-300">{children}</span>
    </p>
  )
}
export default MessageBox
