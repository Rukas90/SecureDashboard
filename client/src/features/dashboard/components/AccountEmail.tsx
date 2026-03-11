import {
  OutlineBoxContainer,
  MiniButton,
  IconMail,
  TagLabel,
  useStateTimeout,
} from "@features/shared"
import useUserProfile from "../hooks/useUserProfile"
import { useTranslation } from "react-i18next"
import AccountSettingSkeleton from "./AccountSettingSkeleton"
import useSendEmailVerification from "../hooks/useSendEmailVerification"
import { toast } from "@src/lib"
import ms from "ms"

const AccountEmail = () => {
  const { t } = useTranslation()
  const { profile, isLoading: isProfileLoading } = useUserProfile()
  const { state: canVerify, beginTimeout } = useStateTimeout()

  const { sendAsync, isSendLoading } = useSendEmailVerification((res) => {
    const retryMs = res.ok ? res.data.retryAfterMs : res.error.retryAfterMs

    if (res.ok) {
      toast.info("Verification email was sent successfully!")
    } else {
      toast.warning(`Please wait another ${ms(retryMs, { long: true })}`)
    }
    if (retryMs > 0) {
      beginTimeout(retryMs + 1000)
    }
  })

  if (!profile || isProfileLoading) {
    return <AccountSettingSkeleton doubleLine={false} />
  }
  const verified = profile.verifiedEmail

  return (
    <OutlineBoxContainer>
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <IconMail className="w-5.5 mb-0.5 text-[#bebab6]" />
          <div className="flex xs:flex-row flex-col-reverse xs:gap-2 gap-1.5 xs:items-center items-start">
            <p className="xs:text-stone-300 text-stone-500 xs:text-sm text-xs">
              {profile?.email}
            </p>
            <TagLabel style={verified ? "green" : "red"}>
              {verified ? t("VERIFIED") : t("NOT_VERIFIED")}
            </TagLabel>
          </div>
        </div>
        {!verified && (
          <MiniButton
            text={t("VERIFY")}
            action={async () => {
              if (isSendLoading) {
                return
              }
              await sendAsync()
            }}
            disabled={isSendLoading || !canVerify}
          />
        )}
      </div>
    </OutlineBoxContainer>
  )
}
export default AccountEmail
