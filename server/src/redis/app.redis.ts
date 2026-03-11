import { ILogger } from "@shared/logger"
import chalk from "chalk"
import { Redis } from "@upstash/redis"

export default class AppRedis {
  #client: Redis | null = null

  constructor(private readonly logger: ILogger) {}

  async connect(url: string, token: string): Promise<void> {
    this.#client = new Redis({ url, token })

    try {
      await this.#client.ping()
      this.logger.success(chalk.red("Redis"), chalk.yellow("App"), "connected.")
    } catch (err) {
      this.logger.error(
        chalk.red("Redis"),
        chalk.yellow("App"),
        "connection failed:",
        err,
      )
      throw err
    }
  }
  disconnect(): void {
    this.#client = null
  }
  get client(): Redis {
    if (!this.#client) throw new Error("App Redis not connected.")
    return this.#client
  }
}
export type IAppRedis = Pick<AppRedis, "client">
