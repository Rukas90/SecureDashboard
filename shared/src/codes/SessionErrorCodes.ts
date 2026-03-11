export const SessionErrorCodes = {
  SESSION_NOT_FOUND: "SESSION_NOT_FOUND",
  SESSION_CANNOT_REVOKE_CURRENT: "SESSION_CANNOT_REVOKE_CURRENT",
  SESSION_REVOKE_FOREIGN: "SESSION_REVOKE_FOREIGN",
} as const

export type SessionErrorCode =
  (typeof SessionErrorCodes)[keyof typeof SessionErrorCodes]
