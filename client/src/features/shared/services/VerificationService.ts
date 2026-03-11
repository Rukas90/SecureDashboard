import { HTTP, type ApiResult } from "@src/lib"

const VerificationService = {
  verifyCode: async (code: string): Promise<ApiResult<string>> => {
    return await HTTP.POST<string>("/v1/verify/code", { code })
  },
}
export default VerificationService
