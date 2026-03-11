export type SessionData = {
  user: AuthUser | null
  canRefresh: boolean
}
export type Scope = "mfa:verify" | "admin:access"

export type AuthUser = {
  scope: Scope[]
  expiresAt: number
}
