export const UserErrorCodes = {
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_PASSWORD_NOT_MATCH: "PASSWORD_NOT_MATCH",
  USER_DELETE_FAILED: "USER_DELETE_FAILED",
  USER_EMAIL_VERIFICATION_COOLDOWN: "USER_EMAIL_VERIFICATION_COOLDOWN",
} as const

export type UserErrorCode = (typeof UserErrorCodes)[keyof typeof UserErrorCodes]
