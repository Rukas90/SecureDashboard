import type { MfaEnrollmentInfo } from "@project/shared"
import { HTTP, type ApiResult } from "@src/lib"

const MfaService = {
  async getEnrollments(): Promise<ApiResult<MfaEnrollmentInfo[]>> {
    return HTTP.GET<MfaEnrollmentInfo[]>("/v1/mfa/enrollments")
  },
  async regenerateRecoveryCodes(): Promise<ApiResult<string[]>> {
    return HTTP.POST<string[]>("/v1/mfa/recovery-codes/regenerate")
  },
}
export default MfaService
