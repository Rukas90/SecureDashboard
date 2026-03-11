import { useMfaEnrollments } from "@features/mfa"
import {
  ConfirmButton,
  ContentContainer,
  DividerLabel,
  Line,
  LinkText,
  NavBar,
  PlainText,
  SectionText,
} from "@src/features/shared"
import { useNavigate } from "react-router-dom"
import RecoveryCodesInfo from "../components/RecoveryCodesInfo"
import useMfaRecoveryMutation from "../hooks/useMfaRecoveryMutation"
import RecoveryCodesList from "../components/RecoveryCodesList"
import { useState } from "react"

const RecoveryCodesView = () => {
  const navigate = useNavigate()
  const [hasDownloaded, setDownloaded] = useState(false)
  const { isLoading, isMfaActive } = useMfaEnrollments()
  const { regenerateAsync, isPending, codes } = useMfaRecoveryMutation()

  if (isLoading) {
    return <></>
  }
  if (!isMfaActive) {
    navigate("/dashboard/security")
  }
  const handleRegenerate = async () => {
    if (isPending) {
      return
    }
    setDownloaded(false)
    await regenerateAsync()
  }
  return (
    <ContentContainer>
      <NavBar />
      <DividerLabel className="text-stone-300 text-xl">
        Two-factor recovery codes
      </DividerLabel>
      <div className="lg:px-60 flex flex-col gap-6 mt-8">
        {!!codes ? (
          <RecoveryCodesList
            codes={codes}
            onDownload={() => setDownloaded(true)}
          />
        ) : (
          <RecoveryCodesInfo />
        )}
        <Line />
        <div>
          <SectionText>Generate new recovery codes</SectionText>
          <PlainText className="mt-2">
            When you generate new recovery codes, you must download or print the
            new codes. Your old codes won't work anymore.
          </PlainText>
          <ConfirmButton
            className="mt-4"
            text="Generate new recovery codes"
            action={handleRegenerate}
          />
        </div>
        <Line />
        <LinkText disabled={codes && !hasDownloaded} to="/dashboard/security">
          Back to settings
        </LinkText>
      </div>
    </ContentContainer>
  )
}
export default RecoveryCodesView
