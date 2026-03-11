export const SudoErrorCodes = {
  SUDO_EXPIRED_ERROR: "SUDO_EXPIRED_ERROR",
  SUDO_VERIFICATION_FAILED_ERROR: "SUDO_VERIFICATION_FAILED_ERROR",
} as const

export type SudoErrorCode = (typeof SudoErrorCodes)[keyof typeof SudoErrorCodes]
