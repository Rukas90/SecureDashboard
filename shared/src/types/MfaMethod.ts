export const MfaMethodCollection = ["totp"] as const
export type MfaMethod = (typeof MfaMethodCollection)[number]
