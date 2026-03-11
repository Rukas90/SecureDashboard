import { AuthContainer } from "@features/auth"
import { MfaContainer } from "@features/mfa"
import { OAuthContainer } from "@features/oauth"
import { ReauthContainer } from "@features/reauth"
import { SessionContainer } from "@features/session"
import { SudoContainer } from "@features/sudo"
import { UserContainer } from "@features/user"
import { VerificationContainer } from "@features/verification"
import { SharedContainer } from "@base/shared/bootstrap"
import { CoreContainer } from "./core.container"
import { DatabaseContainer } from "./database.container"

export type AppContainers = {
  core: CoreContainer
  database: DatabaseContainer
  shared: SharedContainer
  verification: VerificationContainer
  auth: AuthContainer
  mfa: MfaContainer
  oauth: OAuthContainer
  reauth: ReauthContainer
  session: SessionContainer
  sudo: SudoContainer
  user: UserContainer
}
export class AppDeps {
  readonly containers: AppContainers

  private constructor(containers: AppContainers) {
    this.containers = containers
  }
  static async create(): Promise<AppDeps> {
    const core = new CoreContainer()
    const database = await DatabaseContainer.create(
      core.logger,
      core.environment,
    )
    const shared = new SharedContainer(core, database)
    const verification = new VerificationContainer(core, shared, database)
    const session = new SessionContainer(database, shared)
    const user = new UserContainer(database, shared, session)
    const mfa = new MfaContainer(core, database, user)
    const sudo = new SudoContainer(database)
    const auth = new AuthContainer(core, shared, mfa, session, user, sudo)
    const oauth = new OAuthContainer(core, database, auth, user)
    const reauth = new ReauthContainer(sudo, mfa, user, auth)

    return new AppDeps({
      core,
      database,
      shared,
      verification,
      session,
      user,
      mfa,
      sudo,
      auth,
      oauth,
      reauth,
    })
  }
}
