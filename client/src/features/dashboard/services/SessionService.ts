import { type ApiResult, HTTP } from "@src/lib"

const SessionService = {
  async revokeSession(sessionId: string): Promise<ApiResult<string>> {
    return HTTP.DELETE<string>(`/v1/session/${sessionId}`)
  },
}
export default SessionService
