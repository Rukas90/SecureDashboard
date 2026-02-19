import logger from "@shared/logger"
import chalk from "chalk"
import IORedis from "ioredis"

const redis = new IORedis(process.env.REDIS_CLOUD_URL!, {
  maxRetriesPerRequest: null,
})

redis.on("connect", () => {
  logger.success(chalk.red("Redis"), chalk.yellow("Events"), "connected.")
})

redis.on("ready", () => {
  logger.info(chalk.red("Redis"), chalk.yellow("Events"), "is ready.")
})

redis.on("error", (err) => {
  logger.error(chalk.red("Redis"), chalk.yellow("Events"), "error:", err)
})

redis.on("close", () => {
  logger.info(chalk.red("Redis"), chalk.yellow("Events"), "closed.")
})

export default redis
