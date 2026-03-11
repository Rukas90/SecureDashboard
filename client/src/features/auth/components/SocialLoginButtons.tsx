import { GithubButton } from "@features/shared"
import { GoogleButton } from "@features/shared"

const SocialLoginButtons = () => {
  return (
    <div className="w-full flex flex-col gap-2">
      <GoogleButton />
      <GithubButton />
    </div>
  )
}
export default SocialLoginButtons
