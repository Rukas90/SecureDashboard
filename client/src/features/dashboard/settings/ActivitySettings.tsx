import SettingsPanel from "../components/SettingsPanel"
import SettingsSection from "../components/SettingsSection"
import useUserSessions from "../hooks/useUserSessions"
import SessionActivityDetails from "../components/SessionActivityDetails"
import ActivitySessionsHeader from "../components/ActivitySessionsHeader"
import SessionActivityDetailsSkeleton from "../components/SessionActivityDetailsSkeleton"
import { Line } from "@features/shared"

const ActivitySettings = () => {
  const { sessions, isLoading } = useUserSessions()

  const renderSession = () => {
    if (isLoading) {
      return <SessionActivityDetailsSkeleton />
    }
    if (!sessions) {
      return <></>
    }
    return sessions.map((session, index) => (
      <div key={session.id}>
        <SessionActivityDetails session={session} />
        {index !== sessions.length && <Line />}
      </div>
    ))
  }
  return (
    <SettingsPanel>
      <SettingsSection label={<ActivitySessionsHeader />}>
        {renderSession()}
      </SettingsSection>
    </SettingsPanel>
  )
}
export default ActivitySettings
