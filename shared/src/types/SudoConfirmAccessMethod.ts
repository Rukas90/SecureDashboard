import { MfaMethod } from "./MfaMethod"

export type SudoConfirmAccessMethod = MfaMethod | "email" | "password"
