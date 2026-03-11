import { LogoutButton } from "@features/shared"
import LogoBar from "./LogoBar"

const NavBar = () => {
  return (
    <div className="flex flex-row justify-between py-2 mt-4">
      <LogoBar />
      <LogoutButton />
    </div>
  )
}
export default NavBar
