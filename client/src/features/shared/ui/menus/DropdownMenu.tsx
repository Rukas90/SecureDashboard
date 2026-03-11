import { type ReactNode } from "react"
import Dropdown from "./Dropdown"
import DropdownButton from "./DropdownButton"

interface Props extends Pick<React.ComponentProps<"div">, "children"> {
  label: ReactNode | string
}
const DropdownMenu = ({ label, children }: Props) => {
  return (
    <Dropdown<HTMLButtonElement>
      activator={({ toggle, showing, ref }) => (
        <DropdownButton
          toggleMenu={toggle}
          showing={showing}
          ref={ref}
          label={label}
        />
      )}
    >
      {children}
    </Dropdown>
  )
}
export default DropdownMenu
