import { ContentContainer, DividerLabel, Stages } from "@features/shared"
import NavBar from "../../shared/ui/common/NavBar"
import TotpSetupContainer from "../components/TotpSetupContainer"
import TotpSetupContent from "../components/TotpSetupContent"
import { useState } from "react"
import RecoveryCodesContent from "../components/RecoveryCodesContent"
import TotpSetupComplete from "../components/MfaSetupComplete"

type TotpSetupStage = "setup" | "recovery" | "complete"
const STAGE_INDEX: Record<TotpSetupStage, number> = {
  setup: 0,
  recovery: 1,
  complete: 2,
}

const TotpSetupView = () => {
  const [stage, setStage] = useState<TotpSetupStage>("setup")
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)

  const onSetupConfigured = (backupCodes: string[] | null) => {
    setStage(!!backupCodes ? "recovery" : "complete")
    setBackupCodes(backupCodes)
  }
  const stageContent = {
    setup: <TotpSetupContent onConfigured={onSetupConfigured} />,
    recovery: (
      <RecoveryCodesContent
        codes={backupCodes!}
        onContinue={() => setStage("complete")}
      />
    ),
    complete: <TotpSetupComplete />,
  }
  return (
    <ContentContainer>
      <NavBar />
      <DividerLabel className="w-full font-light xs:text-stone-200 text-stone-300 xs:text-2xl text-xl xs:mt-auto mt-4">
        Enable time-based authentication (TOTP)
      </DividerLabel>
      <Stages
        stages={["1", "2", "3"]}
        currentIndex={STAGE_INDEX[stage]}
        className="max-w-full w-64"
      />
      <TotpSetupContainer>{stageContent[stage]}</TotpSetupContainer>
    </ContentContainer>
  )
}
export default TotpSetupView
