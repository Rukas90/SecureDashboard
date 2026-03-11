import { RequestHandler } from "express"
import { AuthService } from "../service/auth.service"
import { LoginService } from "../service/login.service"
import { LogoutService } from "../service/logout.service"
import { RegisterService } from "../service/register.service"
import { SharedContainer } from "@shared/bootstrap"
import { createAuthenticateRequest } from "../middleware/authenticate"
import { MfaContainer } from "@features/mfa"
import { SessionContainer } from "@features/session"
import { UserContainer } from "@features/user"
import { SudoContainer } from "@features/sudo"
import { AuthCookieService } from "../service/cookie.service"
import { CoreContainer } from "@base/bootstrap"

export default class AuthContainer {
  readonly authService: AuthService
  readonly loginService: LoginService
  readonly registerService: RegisterService
  readonly logoutService: LogoutService
  readonly cookieService: AuthCookieService

  readonly authenticate: RequestHandler

  constructor(
    core: CoreContainer,
    shared: SharedContainer,
    mfa: MfaContainer,
    session: SessionContainer,
    user: UserContainer,
    sudo: SudoContainer,
  ) {
    this.authService = new AuthService(
      shared.jwtService,
      mfa.enrollmentsRepository,
      shared.refreshService,
      shared.refreshRepository,
      sudo.sudoService,
      session.sessionRepository,
    )
    this.loginService = new LoginService(
      this.authService,
      mfa.totpService,
      shared.refreshService,
      session.revocationService,
      user.userRepository,
    )
    this.logoutService = new LogoutService(
      shared.refreshService,
      session.revocationService,
    )
    this.registerService = new RegisterService(
      user.userService,
      user.userRepository,
      this.authService,
    )
    this.cookieService = new AuthCookieService(core.config)

    this.authenticate = createAuthenticateRequest(
      shared.jwtService,
      session.revocationCache,
    )
  }
}
