import { MfaContainer } from "@features/mfa"
import { ReauthService } from "../service/reauth.service"
import { UserContainer } from "@features/user"
import { AuthContainer } from "@features/auth"
import { SudoActivateEvent } from "../event/sudo-activate.event"
import { SudoContainer } from "@features/sudo"

export default class ReauthContainer {
  private readonly sudoActivateEvent: SudoActivateEvent
  readonly reauthService: ReauthService

  constructor(
    sudo: SudoContainer,
    mfa: MfaContainer,
    user: UserContainer,
    auth: AuthContainer,
  ) {
    this.sudoActivateEvent = new SudoActivateEvent(sudo.sudoService)
    this.reauthService = new ReauthService(
      mfa.totpService,
      mfa.enrollmentsRepository,
      user.userRepository,
      auth.loginService,
      sudo.sudoService,
      this.sudoActivateEvent,
    )
  }
}
