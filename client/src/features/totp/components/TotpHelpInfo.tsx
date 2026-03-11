import { MessageBox, LinkText } from "@features/shared"

const TotpHelpInfo = () => {
  return (
    <MessageBox label="Don't have an authenticator app?" className="mt-2">
      Download an authenticator app like
      <span> </span>
      <span className="italic">Google Authenticator</span>
      <span> from </span>
      <LinkText
        to="https://apps.apple.com/us/app/google-authenticator/id388497605"
        target="_blank"
      >
        App Stone
      </LinkText>
      <span> or </span>
      <LinkText
        to="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en"
        target="_blank"
      >
        Google Play
      </LinkText>
      .
    </MessageBox>
  )
}
export default TotpHelpInfo
