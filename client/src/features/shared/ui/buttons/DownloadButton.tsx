import { useTranslation } from "react-i18next"
import { IconDownload } from "../icons"
import BaseButton, { type BaseButtonProps } from "./BaseButton"
import clsx from "clsx"

const DownloadButton = (props: BaseButtonProps) => {
  const { t } = useTranslation()
  return (
    <BaseButton
      {...props}
      className={clsx(
        "xs:text-sm text-xs",
        "text-neutral-200 bg-[#287703] transition-colors py-1.5 px-4",
        !props.disabled && "hover:bg-[#318d06] active:bg-[#1f5e02]",
        props.className,
      )}
      icon={<IconDownload className="w-5 h-5 mr-1 mb-1" />}
      text={props.text ?? t("DOWNLOAD")}
    />
  )
}
export default DownloadButton
