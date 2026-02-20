import { config, env } from "@base/app"

export type OAuthConfig = {
  clientId: string
  clientSecret: string
  redirectUri: string
  authUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
}
export const oauthConfig = {
  google: {
    clientId: env.get.GOOGLE_CLIENT_ID,
    clientSecret: env.get.GOOGLE_CLIENT_SECRET,
    redirectUri: config().buildUrl(env.get.GOOGLE_REDIRECT_PATH),
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scope: "openid email profile",
  },
  github: {
    clientId: env.get.GITHUB_CLIENT_ID,
    clientSecret: env.get.GITHUB_CLIENT_SECRET,
    redirectUri: config().buildUrl(env.get.GITHUB_REDIRECT_PATH),
    authUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    emailsUrl: "https://api.github.com/user/emails",
    scope: "read:user user:email",
  },
}
