import type { ReactNode } from "react"

export interface IconButtonProps extends Pick<
  React.ComponentProps<"button">,
  "className" | "ref" | "disabled" | "onClick" | "type"
> {
  icon: ReactNode
  label?: string
}
const IconButton = ({
  icon,
  label,
  className,
  ref,
  disabled,
  ...props
}: IconButtonProps) => {
  return (
    <button
      className={`cursor-pointer ${className}`}
      aria-label={label}
      {...props}
      ref={ref}
      disabled={disabled}
    >
      {icon}
    </button>
  )
}
export default IconButton
