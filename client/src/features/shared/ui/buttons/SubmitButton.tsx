import BaseButton, { type BaseButtonProps } from "./BaseButton"
import clsx from "clsx"

const SubmitButton = (props: BaseButtonProps) => {
  return (
    <BaseButton
      {...props}
      className={clsx(
        "xs:text-sm text-xs",
        "text-neutral-200 bg-lime-700 transition-colors py-2 px-6",
        !props.disabled && "hover:bg-lime-600 active:bg-lime-800",
        props.className,
      )}
    />
  )
}
export default SubmitButton
