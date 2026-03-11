import { IAppRedis } from "@base/redis"
import ms from "ms"

const SUDO_EXPIRY_MS = ms("3h")
const SUDO_EXPIRY_SECONDS = Math.ceil(SUDO_EXPIRY_MS / 1000)

export class SudoService {
  constructor(private readonly redis: IAppRedis) {}

  async getInSudo(sessionId: string) {
    return (await this.redis.client.exists(this.getSudoKey(sessionId))) === 1
  }
  async activateSudo(sessionId: string) {
    await this.redis.client.set(this.getSudoKey(sessionId), "1", {
      ex: SUDO_EXPIRY_SECONDS,
    })
  }
  async extendSudo(sessionId: string) {
    return (
      (await this.redis.client.expire(
        this.getSudoKey(sessionId),
        SUDO_EXPIRY_SECONDS,
      )) === 1
    )
  }
  private getSudoKey(sessionId: string) {
    return `sudo:${sessionId}`
  }
}
export type ISudoService = Pick<SudoService, keyof SudoService>
