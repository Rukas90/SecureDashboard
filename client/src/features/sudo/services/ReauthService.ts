import type { SudoEmailSent } from "@project/shared"
import { HTTP, type ApiResult } from "@src/lib"

const ReauthService = {
  reauthWithTotp: async (code: string): Promise<ApiResult<string>> => {
    return await HTTP.POST<string>("/v1/reauth/totp", { code })
  },
  reauthWithPassword: async (password: string): Promise<ApiResult<string>> => {
    return await HTTP.POST<string>("/v1/reauth/password", { password })
  },
  sendEmailVerification: async (): Promise<ApiResult<SudoEmailSent>> => {
    return await HTTP.POST<SudoEmailSent>("/v1/reauth/email/send")
  },
}
export default ReauthService
