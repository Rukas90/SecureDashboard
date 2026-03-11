import BaseButton, { type BaseButtonProps } from "./BaseButton"
import clsx from "clsx"

const CancelButton = (props: BaseButtonProps) => {
  return (
    <BaseButton
      {...props}
      className={clsx(
        "xs:text-sm text-xs",
        "text-neutral-200 bg-orange-800 transition-colors py-2 px-6",
        !props.disabled && "hover:bg-orange-700 active:bg-orange-900",
        props.className,
      )}
    />
  )
}
export default CancelButton
