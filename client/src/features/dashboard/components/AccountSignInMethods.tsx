import {
  IconGithub,
  IconGoogle,
  OutlineBoxContainer,
  PlainText,
} from "@features/shared"
import useUserProfile from "../hooks/useUserProfile"
import AccountProviderSignIn from "./AccountProviderSignIn"
import type { OAuthProvider } from "@project/shared"
import { useState, type ReactNode } from "react"
import AccountSettingSkeleton from "./AccountSettingSkeleton"
import { useTranslation } from "react-i18next"
import { OAuthService } from "@features/auth"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "@src/lib"

const SignInMethodIcons: Record<OAuthProvider, ReactNode> = {
  google: <IconGoogle className="w-4.5" />,
  github: <IconGithub className="text-stone-300 w-4.5" />,
}
const AccountSignInMethods = () => {
  const { t } = useTranslation()
  const { profile, isLoading } = useUserProfile()
  const queryClient = useQueryClient()
  const [diconnecting, setDisconnecting] = useState(false)

  const handleDisconnect = async (provider: OAuthProvider) => {
    setDisconnecting(true)
    await OAuthService.disconnect(provider)
      .then((res) => {
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
          toast.success("OAuth provider disconnected successfully!")
        }
      })
      .finally(() => setDisconnecting(false))
  }
  if (!profile || isLoading) {
    return <AccountSettingSkeleton />
  }
  if (profile.signInMethods.length === 0) {
    return (
      <OutlineBoxContainer>
        <PlainText>{t("NO_SIGN_IN_METHODS")}</PlainText>
      </OutlineBoxContainer>
    )
  }
  return profile.signInMethods.map((method) => (
    <AccountProviderSignIn
      key={method.provider}
      icon={SignInMethodIcons[method.provider]}
      provider={method.provider}
      username={method.username || "No Username"}
      onDisconnect={handleDisconnect}
      canDisconnect={
        !diconnecting &&
        (profile.hasPassword || profile.signInMethods.length > 1)
      }
    />
  ))
}
export default AccountSignInMethods
