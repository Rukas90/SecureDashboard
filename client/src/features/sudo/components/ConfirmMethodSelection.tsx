import { useUserProfile } from "@features/dashboard"
import { useMfaEnrollments } from "@features/mfa"
import type { SudoConfirmAccessMethod } from "@project/shared"
import { useEffect, useMemo } from "react"
import ConfirmMethodListItem from "./ConfirmMethodListItem"
import useConfirmAccessContext from "../hooks/useConfirmAccessContext"
import { IconSpinner } from "@features/shared"
import { useTranslation } from "react-i18next"

interface Props {
  selectedMethod: SudoConfirmAccessMethod
  onSelected: (method: SudoConfirmAccessMethod) => void
}
const ConfirmMethodSelection = ({ selectedMethod, onSelected }: Props) => {
  const { isProcessing } = useConfirmAccessContext()
  const { profile, isProfileLoading } = useUserProfile()
  const { isMfaActive, isMfaLoading, enrollments } = useMfaEnrollments()
  const { t } = useTranslation()

  const isLoading = isProfileLoading || isMfaLoading

  const availableMethods = useMemo((): SudoConfirmAccessMethod[] => {
    if (isLoading) {
      return []
    }
    const methods: SudoConfirmAccessMethod[] = ["email"]

    if (!isMfaActive && profile?.hasPassword) {
      methods.push("password")
    }
    if (isMfaActive && !!enrollments) {
      enrollments.map((enrollment) => methods.push(enrollment.method))
    }
    return methods
  }, [profile, isMfaActive, isMfaLoading, isProfileLoading])

  useEffect(() => {
    if (availableMethods.length > 0) {
      let method: SudoConfirmAccessMethod = "email"

      if (isMfaActive && !!enrollments) method = enrollments[0].method
      else if (!isMfaActive && profile?.hasPassword) method = "password"

      onSelected(method)
    }
  }, [availableMethods])

  return (
    <div className="mt-4 border border-stone-800 rounded-lg p-4">
      <p className="text-stone-400 font-semibold text-xs">
        {t("HAVING_PROBLEMS")}
      </p>

      <ul className="list-disc marker:text-stone-400">
        {isLoading && (
          <IconSpinner className="text-stone-400 animate-spin w-5 mx-auto py-2" />
        )}
        <div className="pl-4 mt-0.5">
          {availableMethods.map((method) => {
            if (selectedMethod === method) {
              return
            }
            return (
              <ConfirmMethodListItem
                key={`Confirm_Method_${method}`}
                method={method}
                onSelect={onSelected}
                disabled={isProcessing}
              />
            )
          })}
        </div>
      </ul>
    </div>
  )
}
export default ConfirmMethodSelection
