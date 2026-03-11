export type OAuthTokens = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scope?: string
}
export type OAuthUserInfo = {
  providerId: string
  email: string
  name: string
  emailVerified: boolean
  username?: string
}
export interface OAuthRes {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}
