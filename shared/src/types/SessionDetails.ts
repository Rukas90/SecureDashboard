export type SessionStatus = "active" | "expired" | "revoked"

export type Device = "Desktop" | "Mobile" | "Tablet" | "Unknown"

export type UserAgent = {
  browser: string
  browserVersion?: string
  os: string
  osVersion?: string
  device: Device
}
export type Location = {
  city: string
  region?: string
  country: string
}
export type SessionLocation = Location | "localhost"

export type SessionDetails = {
  id: string
  status: SessionStatus
  isCurrent: boolean
  user_agent: UserAgent
  ip_address: string
  location: SessionLocation | null
  created_at: Date
  last_accessed_at: Date
}
