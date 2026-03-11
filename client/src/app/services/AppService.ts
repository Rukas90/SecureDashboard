import type { HealthResponse } from "@project/shared"
import { type ApiResult, HTTP } from "@src/lib"

const AppService = {
  async health(): Promise<ApiResult<HealthResponse>> {
    return HTTP.GET<HealthResponse>("/health")
  },
}
export default AppService
