import type { ReactNode } from "react"
import { useDropdown } from "./contexts/DropdownContext"
import clsx from "clsx"

interface Props {
  content: string | ReactNode
  onSelected?: () => void
  disabled?: boolean
}
const DropdownItem = ({ content, onSelected, disabled = false }: Props) => {
  const { close } = useDropdown()

  const handleClick = () => {
    onSelected?.()
    close()
  }
  return (
    <button
      disabled={disabled}
      onClick={handleClick}
      className={clsx(
        "flex px-2 py-1",
        disabled
          ? "text-stone-500"
          : "text-stone-300 hover:bg-stone-700 transition-colors",
      )}
    >
      {content}
    </button>
  )
}
export default DropdownItem
