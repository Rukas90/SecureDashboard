import { ErrorBox, PlainText } from "@features/shared"
import type { ReactNode } from "react"
import { LanguagePicker } from "@src/features/localization"

interface Props {
  children?: ReactNode
  error?: string | null
}
const AuthView = ({ children, error }: Props) => {
  return (
    <div className="relative flex xs:flex-row flex-col h-full xs:px-16 px-6 py-64 xs:items-start items-center justify-center bg-[#040404]">
      <div className="flex flex-col gap-4 max-w-106.25 w-full items-center text-center">
        {children}
        <ErrorBox isHidden={!error}>{error}</ErrorBox>
      </div>
      <div className="absolute flex flex-col items-center bottom-6 left-1/2 -translate-x-1/2">
        <LanguagePicker />
        <PlainText className="mt-4 opacity-50">
          Created by Rukas Skirkevicius
        </PlainText>
      </div>
    </div>
  )
}
export default AuthView

//from-red-500 to-blue-500 bg-linear-90
