import type React from "react"
import { IconMoreMenu } from "../icons"
import { Dropdown } from "../menus"
import IconButton from "../buttons/IconButton"

interface Props extends Pick<React.ComponentProps<"div">, "children"> {
  disabled?: boolean
}
const MoreInfoMenu = ({ disabled, children }: Props) => {
  return (
    <Dropdown<HTMLButtonElement>
      activator={({ toggle, ref }) => (
        <IconButton
          disabled={disabled}
          icon={<IconMoreMenu className="w-8 text-stone-400" />}
          onClick={toggle}
          ref={ref}
        />
      )}
    >
      {children}
    </Dropdown>
  )
}
export default MoreInfoMenu
