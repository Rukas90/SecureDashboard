import clsx from "clsx"
import type { HTMLAttributeAnchorTarget } from "react"
import { Link } from "react-router-dom"

export interface LinkTextProps extends Pick<
  React.ComponentProps<"div">,
  "children" | "className" | "id" | "style"
> {
  to: string
  target?: HTMLAttributeAnchorTarget | undefined
  disabled?: boolean
}

const LinkText = ({
  to,
  target,
  disabled,
  children,
  className,
  id,
  style,
}: LinkTextProps) => {
  return (
    <Link to={disabled ? "#" : to} target={target}>
      <span
        id={id}
        className={clsx(
          className,
          disabled && "opacity-50",
          !disabled &&
            `hover:text-amber-300
           active:text-amber-200
           hover:after:bg-amber-300
           active:after:bg-amber-200 after:content-['']
           after:absolute after:left-0 after:bottom-0
           after:w-full after:h-px
           after:bg-amber-400
           after:origin-left
           after:scale-x-0
           after:transition-transform after:duration-100 after:ease-in-out
           hover:after:scale-x-100 will-change-transform transition-colors duration-100 ease-in-out`,
          `relative inline-block
           text-amber-400
           `,
        )}
        style={style}
      >
        {children}
      </span>
    </Link>
  )
}
export default LinkText
