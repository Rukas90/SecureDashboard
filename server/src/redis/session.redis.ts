import { ILogger } from "@shared/logger"
import chalk from "chalk"
import { createClient } from "redis"

type SessionRedisClient = ReturnType<typeof createClient>

export default class SessionRedis {
  #client: SessionRedisClient | null = null

  constructor(private readonly logger: ILogger) {}

  async connect(url: string): Promise<void> {
    this.#client = createClient({ url })

    try {
      await this.#client.connect()
      await this.#client.ping()
      this.logger.success(
        chalk.red("Redis"),
        chalk.yellow("Session"),
        "connected.",
      )
    } catch (err) {
      this.logger.error(
        chalk.red("Redis"),
        chalk.yellow("Session"),
        "connection failed:",
        err,
      )
      throw err
    }
  }
  async disconnect(): Promise<void> {
    await this.#client?.quit()
    this.#client = null
  }
  get client(): SessionRedisClient {
    if (!this.#client) throw new Error("Session Redis not connected.")
    return this.#client
  }
}
