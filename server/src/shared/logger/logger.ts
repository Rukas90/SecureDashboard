import { env } from "@base/app"
import chalk from "chalk"

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const

export type LogLevel = keyof typeof LOG_LEVELS

const logger = {
  debug: (...data: any[]) => {
    if (canLog("debug")) {
      console.log(chalk.gray("[DEBUG]"), ...data)
    }
  },
  info: (...data: any[]) => {
    if (canLog("info")) {
      console.log(chalk.blue("[INFO]"), ...data)
    }
  },

  warn: (...data: any[]) => {
    if (canLog("warn")) {
      console.warn(chalk.yellow("[WARN]"), ...data)
    }
  },

  error: (...data: any[]) => {
    if (canLog("error")) {
      console.error(chalk.red("[ERROR]"), ...data)
    }
  },
  success: (...data: any[]) => {
    if (canLog("info")) {
      console.log(chalk.green("[SUCCESS]"), ...data)
    }
  },
  fail: (...data: any[]) => {
    if (canLog("error")) {
      console.error(chalk.red("[FAIL]"), ...data)
    }
  },
}

const getLogLevel = (): LogLevel => env.getOr("LOG_LEVEL", "info") as LogLevel

const canLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] >= LOG_LEVELS[getLogLevel()]
}

export default logger
