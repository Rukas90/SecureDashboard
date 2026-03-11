import clsx from "clsx"

export interface ActionTextProps extends Pick<
  React.ComponentProps<"div">,
  "children" | "className" | "id" | "style"
> {
  action?: () => void
  disabled?: boolean
}

const ActionText = ({
  action,
  disabled,
  children,
  className,
  id,
  style,
}: ActionTextProps) => {
  return (
    <button
      onClick={action}
      id={id}
      className={clsx(
        className,
        disabled && "opacity-50",
        !disabled &&
          `hover:text-amber-300 active:text-amber-200 
           hover:after:bg-amber-300 active:after:bg-amber-200 
           transition-colors
           duration-100 ease-in-out
           after:bg-amber-400
           hover:after:scale-x-100 after:transition-transform 
           after:duration-100 after:ease-in-out 
           will-change-transform
           after:content-['']
           after:absolute after:left-0 after:bottom-0
           after:w-full after:h-px
           after:origin-left
           after:scale-x-0
          `,
        `relative inline-block
       text-amber-400
        `,
      )}
      style={style}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
export default ActionText
