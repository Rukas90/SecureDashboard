import { IAppRedis } from "@base/redis"

export class RevocationCache {
  constructor(private readonly redis: IAppRedis) {}

  async revokeSession(sessionId: string, ttlMs: number) {
    await this.redis.client.set(`revoked_session:${sessionId}`, "1", {
      ex: Math.ceil(ttlMs / 1000),
    })
  }

  async isRevoked(sessionId: string): Promise<boolean> {
    return !!(await this.redis.client.get(`revoked_session:${sessionId}`))
  }
}
export type IRevocationCache = Pick<RevocationCache, keyof RevocationCache>
