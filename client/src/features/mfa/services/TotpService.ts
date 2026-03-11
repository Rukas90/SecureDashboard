import type {
  AuthResponseDto,
  ConfirmEnrollmentResponse,
  TotpCode,
  TotpData,
} from "@project/shared"
import { HTTP, type ApiResult } from "@src/lib"

const TotpService = {
  async getInitData(): Promise<ApiResult<TotpData>> {
    return HTTP.POST<TotpData>("/v1/mfa/totp/initialize")
  },
  async confirmSetup(
    code: TotpCode,
  ): Promise<ApiResult<ConfirmEnrollmentResponse>> {
    return HTTP.POST<ConfirmEnrollmentResponse>("/v1/mfa/totp/confirm", code)
  },
  async login(code: TotpCode): Promise<ApiResult<AuthResponseDto>> {
    return HTTP.POST<AuthResponseDto>("/v1/auth/totp/login", code)
  },
  async revoke(code: TotpCode): Promise<ApiResult<string>> {
    return HTTP.POST<string>("/v1/mfa/totp/revoke", code)
  },
}
export default TotpService
