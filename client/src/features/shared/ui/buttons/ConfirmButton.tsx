import BaseButton, { type BaseButtonProps } from "./BaseButton"
import clsx from "clsx"

const ConfirmButton = (props: BaseButtonProps) => {
  return (
    <BaseButton
      {...props}
      className={clsx(
        "xs:text-sm text-xs",
        "text-neutral-200 bg-stone-800 transition-colors py-2 px-6",
        !props.disabled && "hover:bg-stone-700 active:bg-stone-600",
        props.className,
      )}
    />
  )
}
export default ConfirmButton
