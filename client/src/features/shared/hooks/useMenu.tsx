import { useCallback, useEffect, useState } from "react"
import { useLockBodyScroll } from "./useLockBodyScroll"

type MenuOptions = {
  minWidth?: number
}
const useMenu = ({ minWidth = 1024 }: MenuOptions) => {
  const getCollapsedState = () => window.innerWidth < minWidth

  const [isOpen, setIsOpen] = useState(false)
  const { lockScroll, unlockScroll } = useLockBodyScroll()
  const [isCollapsed, setCollapsed] = useState(getCollapsedState())

  const open = useCallback(() => {
    setIsOpen(true)
    lockScroll()
  }, [lockScroll])

  const close = useCallback(() => {
    setIsOpen(false)
    unlockScroll()
  }, [unlockScroll])

  const toggle = useCallback(() => {
    isOpen ? close() : open()
  }, [isOpen, open, close])

  const setOpen = useCallback(
    (opened: boolean) => {
      opened ? open() : close()
    },
    [open, close],
  )

  useEffect(() => {
    const handleResize = () => {
      const wasCollapsed = isCollapsed
      const nowCollapsed = getCollapsedState()

      setCollapsed(nowCollapsed)

      if (!nowCollapsed) {
        open()
      } else if (!wasCollapsed && nowCollapsed) {
        close()
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isOpen, close])

  useEffect(() => {
    document.documentElement.classList.toggle("hide-scrollbar", isOpen)
    return () => document.documentElement.classList.remove("hide-scrollbar")
  }, [isOpen])

  return { isOpen, open, close, toggle, setOpen, isCollapsed }
}
export default useMenu
