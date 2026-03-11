import { ILogger } from "@shared/logger"
import chalk from "chalk"
import IORedis from "ioredis"

export default class CloudRedis {
  #client: IORedis | null = null

  constructor(private readonly logger: ILogger) {}

  async connect(url: string): Promise<void> {
    this.#client = new IORedis(url, {
      maxRetriesPerRequest: null,
    })

    this.#client.on("connect", () => {
      this.logger.success(
        chalk.red("Redis"),
        chalk.yellow("Events"),
        "connected.",
      )
    })

    this.#client.on("ready", () => {
      this.logger.info(chalk.red("Redis"), chalk.yellow("Events"), "is ready.")
    })

    this.#client.on("error", (err) => {
      this.logger.error(
        chalk.red("Redis"),
        chalk.yellow("Events"),
        "error:",
        err,
      )
    })

    this.#client.on("close", () => {
      this.logger.info(chalk.red("Redis"), chalk.yellow("Events"), "closed.")
    })

    await new Promise<void>((resolve, reject) => {
      this.#client!.once("ready", resolve)
      this.#client!.once("error", reject)
    })
  }
  async disconnect(): Promise<void> {
    await this.#client?.quit()
    this.#client = null
  }
  get client(): IORedis {
    if (!this.#client) throw new Error("Cloud Redis not connected.")
    return this.#client
  }
}
