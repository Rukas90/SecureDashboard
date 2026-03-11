import { downloadBackupCodes } from "@features/mfa"
import {
  ConfirmButton,
  DownloadButton,
  HeadingText,
  Line,
  MessageBox,
  PlainText,
} from "@features/shared"
import { useState } from "react"

interface Props {
  codes: string[]
  onContinue: () => void
}
const RecoveryCodesContent = ({ codes, onContinue }: Props) => {
  const [hasDownloaded, setDownloaded] = useState(false)

  const handleDownloadCodes = () => {
    downloadBackupCodes(codes)
    setDownloaded(true)
  }

  return (
    <div className="flex flex-col gap-4 items-center w-full">
      <HeadingText>Download your recovery codes</HeadingText>
      <PlainText className="text-center xs:text-sm! text-xs! text-stone-400!">
        You can use recovery codes as a second factor to authenticate in case
        you lose access to your device. It is recommended saving the codes with
        a secure password manager such as NordPass, 1Password, or Authy.
      </PlainText>
      <MessageBox label="Keep your recovery codes in a safe spot">
        If you lose your device and don't have the recovery codes, you will lose
        access to your account.
      </MessageBox>
      <ul className="text-stone-300 xs:text-lg grid xs:grid-cols-2 grid-cols-1 place-items-center bg-stone-800 p-6 w-full list-disc marker:text-stone-500 space-y-0.5">
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
      <Line defaultColor={false} className="bg-stone-800" />
      <MessageBox variant="default" label="Caution">
        Make sure to download and save your recovery codes as you will not be
        able to see them again!
      </MessageBox>

      <div className="ml-auto">
        <ConfirmButton
          disabled={!hasDownloaded}
          text="I have saved my recovery codes"
          action={onContinue}
        />
      </div>
    </div>
  )
}
export default RecoveryCodesContent
