import { NavLink } from "react-router-dom"

interface Props extends Pick<React.ComponentProps<"span">, "children"> {
  to: string
  onClicked: () => void
}
const NavButton = ({ to, onClicked, children }: Props) => {
  return (
    <li>
      <NavLink
        to={to}
        target="_self"
        className={({ isActive }) => `${
          isActive
            ? `
            after:scale-x-100 
            text-stone-200 
            after:bg-stone-200
            pointer-events-none
            `
            : `
            after:scale-x-0 
            hover:after:scale-x-100 
            text-stone-400
            hover:text-stone-200
            after:bg-stone-400 
            hover:after:bg-stone-200
            `
        } 
        xs:text-lg text-2xl 
        cursor-pointer transition relative inline-block 
        after:content-['']
        after:absolute after:left-0 after:-bottom-1.5
        after:w-full after:h-0.75
        after:origin-left
        after:transition-transform after:duration-100 after:ease-in-out
        `}
        onClick={onClicked}
      >
        {children}
      </NavLink>
    </li>
  )
}
export default NavButton
