import { env } from "@base/app"
import logger from "@base/shared/logger"
import chalk from "chalk"
import { createClient } from "redis"

export const redis = createClient({
  url: env.get.UPSTASH_REDIS_SESSION_URL,
})

await redis.connect()

redis
  .ping()
  .then(() => {
    logger.success(chalk.red("Redis"), chalk.yellow("App"), "connected.")
  })
  .catch((err) => {
    logger.error(
      chalk.red("Redis"),
      chalk.yellow("App"),
      "connection failed:",
      err,
    )
  })

export default redis
