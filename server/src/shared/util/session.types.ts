import { OAuthProvider } from "@project/shared"
import { AccessTokenClaims } from "../token"

export type AuthSession = {
  sid: string | undefined
  userId: string
  expiresAt: number
  claims: AccessTokenClaims
}
export type OAuthSession = {
  state: string
  verifier: string
  provider: OAuthProvider
}
