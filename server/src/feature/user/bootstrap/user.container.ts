import { DatabaseContainer } from "@base/bootstrap"
import { UserRepository } from "../repository/user.repository"
import { UserService } from "../service/user.service"
import { SessionContainer } from "@features/session"
import { SharedContainer } from "@shared/bootstrap"
import { VerifyUserEvent } from "../event/verify-email.event"

export default class UserContainer {
  readonly userRepository: UserRepository
  readonly userService: UserService

  readonly verifyUserEvent: VerifyUserEvent

  constructor(
    database: DatabaseContainer,
    shared: SharedContainer,
    session: SessionContainer,
  ) {
    // Create repositories
    this.userRepository = new UserRepository(database.client)

    // Create events
    this.verifyUserEvent = new VerifyUserEvent(this.userRepository)

    // Create services
    this.userService = new UserService(
      this.userRepository,
      session.sessionService,
      shared.refreshService,
      this.verifyUserEvent,
    )
  }
}
