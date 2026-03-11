import { IconLock, Line } from "@features/shared"
import { useState } from "react"
import clsx from "clsx"
import { ConfirmAccessProvider } from "../providers/ConfirmAccessProvider"
import ConfirmAccessForm from "./ConfirmAccessForm"
import ConfirmMethodSelection from "./ConfirmMethodSelection"
import type { SudoConfirmAccessMethod } from "@project/shared"
import { useTranslation } from "react-i18next"

interface Props extends React.ComponentProps<"div"> {
  showHeader?: boolean
}
const SudoConfirmAccess = ({ showHeader = true, ...props }: Props) => {
  const { t } = useTranslation()
  const [selectedMethod, setSelectedMethod] =
    useState<SudoConfirmAccessMethod>("totp")

  return (
    <div {...props}>
      {showHeader && (
        <>
          <div className="bg-[#181513] p-4 flex gap-2 items-center rounded-t-lg">
            <IconLock className="text-stone-400 w-3.5" />
            <p className="text-stone-400 text-sm mt-0.5">
              {t("CONFIRM_ACCESS")}
            </p>
          </div>
          <Line />
        </>
      )}
      <div
        className={clsx(
          "bg-[#110f0e] p-4",
          showHeader ? "rounded-lg" : "rounded-b-lg",
        )}
      >
        <ConfirmAccessProvider>
          <ConfirmAccessForm currentMethod={selectedMethod} />
          <ConfirmMethodSelection
            selectedMethod={selectedMethod}
            onSelected={setSelectedMethod}
          />
        </ConfirmAccessProvider>
      </div>
    </div>
  )
}
export default SudoConfirmAccess
