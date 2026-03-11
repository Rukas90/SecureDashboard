import { AppConfig, IEnvironment } from "@base/app"

export type OAuthProviderConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
}

export type GitHubOAuthConfig = OAuthProviderConfig & {
  emailsUrl: string
}

export class OAuthConfigService {
  readonly google: OAuthProviderConfig
  readonly github: GitHubOAuthConfig

  constructor(environment: IEnvironment, config: AppConfig) {
    this.google = {
      clientId: environment.get.GOOGLE_CLIENT_ID,
      clientSecret: environment.get.GOOGLE_CLIENT_SECRET,
      redirectUri: config.buildUrl(environment.get.GOOGLE_REDIRECT_PATH),
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
      scope: "openid email profile",
    }
    this.github = {
      clientId: environment.get.GITHUB_CLIENT_ID,
      clientSecret: environment.get.GITHUB_CLIENT_SECRET,
      redirectUri: config.buildUrl(environment.get.GITHUB_REDIRECT_PATH),
      authUrl: "https://github.com/login/oauth/authorize",
      tokenUrl: "https://github.com/login/oauth/access_token",
      userInfoUrl: "https://api.github.com/user",
      emailsUrl: "https://api.github.com/user/emails",
      scope: "read:user user:email",
    }
  }
}
export type IOAuthConfigService = Pick<
  OAuthConfigService,
  keyof OAuthConfigService
>
