import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react"
import { createPortal } from "react-dom"
import clsx from "clsx"
import { DropdownContext } from "./contexts/DropdownContext"

interface Props<TRef extends HTMLElement> extends Pick<
  React.ComponentProps<"div">,
  "children"
> {
  activator: (props: {
    toggle: () => void
    showing: boolean
    ref?: RefObject<TRef | null>
  }) => ReactNode
}

const Dropdown = <TRef extends HTMLElement>({
  activator,
  children,
}: Props<TRef>) => {
  const [showing, setShowing] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  const activatorRef = useRef<TRef | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = () => {
    if (!activatorRef.current) {
      return
    }
    const rect = activatorRef.current.getBoundingClientRect()

    const menuHeight = menuRef.current?.offsetHeight || 200
    const menuWidth = menuRef.current?.offsetWidth || 160

    const EDGE_PADDING = 10

    const spaceBelow = window.innerHeight - rect.bottom - EDGE_PADDING
    const spaceAbove = rect.top
    const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow

    const wouldOverflowRight =
      rect.left + menuWidth + EDGE_PADDING > window.innerWidth

    const top = openUpward
      ? Math.max(EDGE_PADDING, rect.top - menuHeight)
      : rect.bottom
    const left = wouldOverflowRight
      ? Math.max(EDGE_PADDING, rect.right - menuWidth)
      : rect.left

    setPosition({
      top,
      left,
      width: rect.width,
    })
  }
  const closeMenu = () => setShowing(false)

  const handleClickAway = (e: MouseEvent) => {
    if (
      activatorRef.current &&
      !activatorRef.current.contains(e.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(e.target as Node)
    ) {
      closeMenu()
    }
  }
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeMenu()
    }
  }
  useLayoutEffect(() => {
    if (!showing) {
      return
    }
    updatePosition()

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickAway)
      document.addEventListener("keydown", handleEscape)
      window.addEventListener("resize", updatePosition)
      window.addEventListener("blur", closeMenu)
    }, 0)

    return () => {
      document.removeEventListener("mousedown", handleClickAway)
      document.removeEventListener("keydown", handleEscape)
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("blur", closeMenu)
    }
  }, [showing])

  const toggleMenu = () => setShowing((prev) => !prev)

  return (
    <>
      {activator({ toggle: toggleMenu, showing, ref: activatorRef })}
      {showing &&
        createPortal(
          <DropdownContext.Provider value={{ close: closeMenu }}>
            <div
              ref={menuRef}
              className={clsx(
                "flex flex-col absolute bg-stone-800 rounded-md shadow-lg border border-stone-700 py-1 min-w-40 max-w-full opacity-0 transition-transform -translate-y-full",
                showing && "opacity-100 translate-y-0",
              )}
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                minWidth: `${position.width}px`,
                zIndex: 9999,
              }}
            >
              {children}
            </div>
          </DropdownContext.Provider>,
          document.body,
        )}
    </>
  )
}
export default Dropdown
