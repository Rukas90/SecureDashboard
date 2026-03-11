import { SignInMethod } from "./SignInMethod"

export type UserProfile = {
  email: string
  hasPassword: boolean
  verifiedEmail: boolean
  signInMethods: SignInMethod[]
}
