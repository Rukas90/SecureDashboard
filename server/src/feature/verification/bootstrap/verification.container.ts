import { CoreContainer, DatabaseContainer } from "@base/bootstrap"
import { EventManager } from "../event/event.manager"
import { VerificationService } from "../service/verification.service"
import { VerificationRepository } from "../repository/verification.repository"
import { SharedContainer } from "@base/shared/bootstrap"
import { EventRegistry } from "../event/event.registry"
import { VerificationEvent } from "../event/verification.event"

export default class VerificationContainer {
  private readonly verificationRepository: VerificationRepository
  readonly verificationService: VerificationService
  private readonly manager: EventManager
  private readonly registry: EventRegistry

  constructor(
    core: CoreContainer,
    shared: SharedContainer,
    database: DatabaseContainer,
  ) {
    this.verificationRepository = new VerificationRepository(database.client)
    this.registry = new EventRegistry(core.logger)
    this.verificationService = new VerificationService(
      shared.mailerService,
      this.verificationRepository,
      this.registry,
      database.unitOfWork,
      core.environment,
      core.config,
    )
    this.manager = new EventManager(
      this.registry,
      this.verificationService,
      database.cloudRedis,
    )
    VerificationEvent.initialize(this.manager)
  }
}
