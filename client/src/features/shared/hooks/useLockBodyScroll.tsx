import { useCallback, useEffect, useLayoutEffect, useRef } from "react"

export const useLockBodyScroll = () => {
  const lockRequests = useRef(0)

  const lockScroll = useCallback(() => {
    lockRequests.current += 1
    if (lockRequests.current === 1) {
      document.body.style.overflow = "hidden"
    }
  }, [])

  const unlockScroll = useCallback(() => {
    lockRequests.current = Math.max(lockRequests.current - 1, 0)
    if (lockRequests.current === 0) {
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    return () => {
      unlockScroll()
    }
  }, [unlockScroll])

  useLayoutEffect(() => {
    document.body.style.overflow = ""
  }, [])

  return { lockScroll, unlockScroll }
}
