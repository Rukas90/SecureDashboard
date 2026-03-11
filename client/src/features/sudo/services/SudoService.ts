import { HTTP, type ApiResult } from "@src/lib"

const SudoService = {
  getInSudo: async (): Promise<ApiResult<boolean>> => {
    return await HTTP.GET<boolean>("/v1/session/sudo")
  },
}
export default SudoService
