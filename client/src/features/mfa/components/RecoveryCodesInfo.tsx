import { MessageBox, PlainText } from "@features/shared"

const RecoveryCodesInfo = () => {
  return (
    <div className="flex flex-col gap-6 rounded-lg">
      <PlainText className="text-stone-400! text-center">
        Recovery codes can be used to access your account in the event you lose
        access to your device and cannot receive two-factor authentication
        codes.
      </PlainText>
      <MessageBox>
        You cannot view your current recovery codes, once they were created. If
        you have lost access to your current recovery codes, use the option
        below to generate new codes.
      </MessageBox>
    </div>
  )
}
export default RecoveryCodesInfo
