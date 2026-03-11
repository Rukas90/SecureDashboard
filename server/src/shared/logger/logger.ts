import { IEnvironment } from "@base/app"
import chalk from "chalk"

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const

export type LogLevel = keyof typeof LOG_LEVELS

export class Logger {
  private logLevel: LogLevel

  constructor(environment: IEnvironment) {
    this.logLevel = environment.getOr("LOG_LEVEL", "info") as LogLevel
  }

  debug(...data: any[]) {
    if (this.canLog("debug")) {
      console.log(chalk.gray("[DEBUG]"), ...data)
    }
  }
  info(...data: any[]) {
    if (this.canLog("info")) {
      console.log(chalk.blue("[INFO]"), ...data)
    }
  }
  warn(...data: any[]) {
    if (this.canLog("warn")) {
      console.warn(chalk.yellow("[WARN]"), ...data)
    }
  }
  error(...data: any[]) {
    if (this.canLog("error")) {
      console.error(chalk.red("[ERROR]"), ...data)
    }
  }
  success(...data: any[]) {
    if (this.canLog("info")) {
      console.log(chalk.green("[SUCCESS]"), ...data)
    }
  }
  fail(...data: any[]) {
    if (this.canLog("error")) {
      console.error(chalk.red("[FAIL]"), ...data)
    }
  }
  private canLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.logLevel]
  }
}
export type ILogger = Pick<
  Logger,
  "debug" | "info" | "warn" | "error" | "success" | "fail"
>
