import { DangerButton } from "@features/shared"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import UserService from "../services/UserService"
import { useAuthContext } from "@src/features/auth"
import { toast } from "@src/lib"

const DeleteAccountButton = () => {
  const { setUser } = useAuthContext()
  const [isDeleting, setIsDeleting] = useState(false)
  const { t } = useTranslation()

  const handleDelete = async () => {
    setIsDeleting(true)
    await UserService.deleteAccount()
      .then((res) => {
        if (res.ok) {
          setUser(null)
          toast.success("The account was deleted successfully!")
        }
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }
  return (
    <DangerButton
      className="text-sm"
      text={t("DELETE_YOUR_ACCOUNT")}
      action={handleDelete}
      disabled={isDeleting}
    />
  )
}
export default DeleteAccountButton
