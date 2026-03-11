import { useContext } from "react"
import { ConfirmAccessContext } from "../contexts/ConfirmAccessContext"

const useConfirmAccessContext = () => {
  const context = useContext(ConfirmAccessContext)
  if (!context) {
    throw new Error(
      "useConfirmAccessContext must be used within ConfirmAccessProvider",
    )
  }
  return context
}
export default useConfirmAccessContext
