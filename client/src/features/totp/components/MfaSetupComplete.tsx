import {
  HeadingText,
  MessageBox,
  PlainText,
  SubmitButton,
} from "@src/features/shared"
import { Link } from "react-router-dom"

const TotpSetupComplete = () => {
  return (
    <div>
      <HeadingText className="mb-2">Successfully configured</HeadingText>
      <PlainText className="mb-4">
        The setup was completed successfully. Your account is now protected!
      </PlainText>
      <MessageBox>
        You have enabled two-factor authentication using your authenticator app.
      </MessageBox>
      <Link to="/dashboard/security" target="_self">
        <SubmitButton className="mx-auto mt-4" text="Done" />
      </Link>
    </div>
  )
}
export default TotpSetupComplete
