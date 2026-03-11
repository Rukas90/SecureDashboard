import { UserSession } from "@prisma/client"
import { Result, SessionDetails, SessionStatus } from "@project/shared"
import { ISessionRepository } from "../repository/session.repository"
import { parseLocation, parseUserAgent } from "../util/session.util"

export class SessionService {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async getSessions(userId: string, familyId: string) {
    const sessions = await this.sessionRepository.getAllByUserId(userId)
    if (!sessions.ok) return sessions

    if (!sessions.data) {
      return Result.success([])
    }
    const activeSessions = sessions.data.filter(
      (s) => this.getSessionStatus(s) === "active",
    )
    const staleSessions = sessions.data
      .filter((s) => this.getSessionStatus(s) !== "active")
      .slice(0, 2)

    return Result.success(
      [...activeSessions, ...staleSessions].map(
        (session): SessionDetails => ({
          id: session.id,
          status: this.getSessionStatus(session),
          isCurrent: session.family_id === familyId,
          user_agent: parseUserAgent(session.user_agent),
          ip_address: session.ip_address,
          location: parseLocation(session.location, session.ip_address),
          created_at: session.created_at,
          last_accessed_at: session.last_accessed_at,
        }),
      ),
    )
  }
  getSessionStatus(session: UserSession): SessionStatus {
    if (session.revoked) {
      return "revoked"
    }
    if (session.expires_at <= new Date()) {
      return "expired"
    }
    return "active"
  }
}
export type ISessionService = Pick<
  SessionService,
  "getSessionStatus" | "getSessions"
>
