import clsx from "clsx"
import { IconArrowDown } from "../icons"
import type { ReactNode } from "react"

interface Props extends Pick<React.ComponentProps<"button">, "ref"> {
  toggleMenu: () => void
  label?: ReactNode | string
  showing?: boolean
}
const DropdownButton = ({ toggleMenu, label, showing, ...props }: Props) => {
  return (
    <button
      {...props}
      onClick={toggleMenu}
      className={clsx(
        "flex gap-1 items-center cursor-pointer px-2 py-1.25 rounded-md transition-colors",
        "text-stone-300 bg-stone-800 hover:bg-[#302b2a] active:bg-[#201d1c]",
      )}
    >
      {label}
      <IconArrowDown
        className={clsx(
          "text-stone-300 size-6 transition-transform",
          showing && "-rotate-180",
        )}
      />
    </button>
  )
}
export default DropdownButton
