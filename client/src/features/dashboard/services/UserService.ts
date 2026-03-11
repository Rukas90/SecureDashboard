import type {
  PasswordSetRequest,
  PasswordUpdateRequest,
  SendEmailVerifyResponseDto,
  SessionDetails,
  UserProfile,
} from "@project/shared"
import { type ApiResult, HTTP } from "@src/lib"

const UserService = {
  async getProfile(): Promise<ApiResult<UserProfile>> {
    return HTTP.GET<UserProfile>("/v1/user/profile")
  },
  async setPassword(data: PasswordSetRequest): Promise<ApiResult<string>> {
    return HTTP.POST<string>("/v1/user/password", data)
  },
  async updatePassword(
    data: PasswordUpdateRequest,
  ): Promise<ApiResult<string>> {
    return HTTP.POST<string>("/v1/user/password", data)
  },
  async getSessions(): Promise<ApiResult<SessionDetails[]>> {
    return HTTP.GET<SessionDetails[]>("/v1/user/sessions")
  },
  async deleteAccount(): Promise<ApiResult<void>> {
    return HTTP.DELETE<void>("/v1/user")
  },
  async sendEmailVerification(): Promise<
    ApiResult<SendEmailVerifyResponseDto>
  > {
    return HTTP.POST<SendEmailVerifyResponseDto>("/v1/user/email-verifications")
  },
}
export default UserService
