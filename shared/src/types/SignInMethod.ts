import { OAuthProvider } from "./OAuthProvider"

export type SignInMethod = {
  provider: OAuthProvider
  username: string
}
