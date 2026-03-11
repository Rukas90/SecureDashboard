import { DatabaseContainer } from "@base/bootstrap"
import { SessionRepository } from "../repository/session.repository"
import { SessionRevokeService } from "../service/revocation.service"
import { SessionService } from "../service/session.service"
import { SharedContainer } from "@shared/bootstrap"
import { RevocationCache } from "../repository/revocation.repository"

export default class SessionContainer {
  readonly revocationCache: RevocationCache
  readonly sessionRepository: SessionRepository

  readonly sessionService: SessionService
  readonly revocationService: SessionRevokeService

  constructor(database: DatabaseContainer, shared: SharedContainer) {
    // Create repositories
    this.revocationCache = new RevocationCache(database.appRedis)
    this.sessionRepository = new SessionRepository(database.client)

    // Create services
    this.sessionService = new SessionService(this.sessionRepository)
    this.revocationService = new SessionRevokeService(
      shared.refreshRepository,
      this.sessionRepository,
      shared.refreshService,
      this.revocationCache,
    )
  }
}
