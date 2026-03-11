import { CopyableField, HeadingText, PlainText } from "@features/shared"
import type { TotpData } from "@project/shared"
import Skeleton from "react-loading-skeleton"

interface Props {
  data: TotpData | null
  isLoading?: boolean
}
const TotpSetupData = ({ data, isLoading = true }: Props) => {
  return (
    <div className="w-full h-full flex flex-col items-center">
      <HeadingText>Setup authenticator app</HeadingText>
      <PlainText className="xs:text-start text-center xs:mt-auto mt-2">
        Scan the QR code below using an authenticator app:
      </PlainText>
      {isLoading ? (
        <Skeleton className="my-4 rounded-sm size-48!"></Skeleton>
      ) : (
        <img className="my-4 rounded-sm w-48" src={data?.qrCodeURi} />
      )}
      <PlainText className="xs:mb-auto mb-2">
        Or enter the setup key manually:
      </PlainText>
      <CopyableField
        id="totp-setup-key"
        value={data?.setupKey}
        readOnly
        isHidden
        showSkeleton={isLoading}
      />
      <PlainText className="mt-2">Verify the code from the app:</PlainText>
    </div>
  )
}
export default TotpSetupData
