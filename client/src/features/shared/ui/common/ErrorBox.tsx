import clsx from "clsx"
import { IconClose } from "../icons"
import { IconButton } from "../buttons"

interface Props extends Pick<
  React.ComponentProps<"div">,
  "className" | "children"
> {
  isHidden?: boolean
  visibleClasses?: string
  onClose?: () => void
}
const ErrorBox = ({
  isHidden = true,
  onClose,
  className,
  visibleClasses,
  children,
}: Props) => {
  return (
    <div
      className={clsx(
        "flex gap-2 items-center text-[0.95rem] rounded-sm bg-[#5a111159] border border-[#741a1aaf] text-gray-300 w-full transition-all duration-75",
        className,
        isHidden
          ? "opacity-0 max-h-0 p-0 m-0 border-0"
          : clsx("opacity-100 p-2", visibleClasses),
      )}
    >
      <p className="p-0 m-0 w-full text-center xs:text-sm text-xs">
        {children}
      </p>
      {onClose && (
        <IconButton
          type="button"
          icon={<IconClose />}
          className="w-4 h-4 text-[#8b4938]"
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        />
      )}
    </div>
  )
}
export default ErrorBox
