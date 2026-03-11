import { MfaMethod } from "./MfaMethod"

export type MfaEnrollmentInfo = {
  method: MfaMethod
  configured: boolean
}
