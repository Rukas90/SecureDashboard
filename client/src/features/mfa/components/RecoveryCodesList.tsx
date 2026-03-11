import {
  DownloadButton,
  HeadingText,
  LinkText,
  MessageBox,
  PlainText,
} from "@features/shared"
import { downloadBackupCodes } from "../utils/DownloadUtils"

interface Props {
  codes: string[]
  onDownload?: () => void
}
const RecoveryCodesList = ({ codes, onDownload }: Props) => {
  const handleDownloadCodes = () => {
    downloadBackupCodes(codes)
    onDownload?.()
  }
  return (
    <div className="flex flex-col gap-6">
      <HeadingText>Download your recovery codes</HeadingText>
      <PlainText className="text-center xs:text-sm! text-xs! text-stone-400!">
        You can use recovery codes as a second factor to authenticate in case
        you lose access to your device. It is recommended saving the codes with
        a secure password manager such as{" "}
        <LinkText to="https://nordpass.com/" target="_blank">
          NordPass
        </LinkText>
        ,{" "}
        <LinkText to="https://1password.com/" target="_blank">
          1Password
        </LinkText>
        , or{" "}
        <LinkText to="https://www.authy.com/" target="_blank">
          Authy
        </LinkText>
        .
      </PlainText>
      <MessageBox label="Keep your recovery codes in a safe spot">
        If you lose your device and don't have the recovery codes, you will lose
        access to your account.
      </MessageBox>
      <ul className="text-stone-300 xs:text-lg grid xs:grid-cols-2 grid-cols-1 place-items-center bg-stone-800 p-6 w-full list-disc rounded border border-stone-700 marker:text-stone-500 space-y-0.5">
        {codes?.map((code) => (
          <li
            key={`revovery_code_${code}`}
            className="font-mono! font-semibold"
          >
            {code.slice(0, 5)}-{code.slice(5)}
          </li>
        ))}
      </ul>
      <DownloadButton className="ml-auto" action={handleDownloadCodes} />
    </div>
  )
}
export default RecoveryCodesList
