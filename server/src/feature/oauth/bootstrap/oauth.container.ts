import { CoreContainer, DatabaseContainer } from "@base/bootstrap"
import { OAuthRepository } from "../repository/oauth.repository"
import { OAuthConfigService } from "../service/config.service"
import { OAuthService } from "../service/oauth.service"
import { UserInfoService } from "../service/userInfo.service"
import { AuthContainer } from "@features/auth"
import { UserContainer } from "@features/user"
import { RequestHandler } from "express"
import createValidateOAuthProvider from "../middleware/oauthProvider.validate"

export default class OAuthContainer {
  readonly oauthRepository: OAuthRepository

  readonly configService: OAuthConfigService
  readonly oauthService: OAuthService
  readonly userInfoService: UserInfoService

  readonly validateOAuthProvider: RequestHandler

  constructor(
    core: CoreContainer,
    database: DatabaseContainer,
    auth: AuthContainer,
    user: UserContainer,
  ) {
    // Create repositories
    this.oauthRepository = new OAuthRepository(database.client)

    // Create services
    this.configService = new OAuthConfigService(core.environment, core.config)
    this.userInfoService = new UserInfoService(this.configService)
    this.oauthService = new OAuthService(
      auth.authService,
      database.unitOfWork,
      this.oauthRepository,
      user.userRepository,
      this.userInfoService,
      this.configService,
      core.logger,
      core.config,
    )

    // Create middleware
    this.validateOAuthProvider = createValidateOAuthProvider()
  }
}
