import logger from "@shared/logger"
import chalk from "chalk"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

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
