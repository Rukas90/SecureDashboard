import { glob } from "glob"
import path from "path"
import { FeaturesDirectory, FileExtension, LoadOptions } from "./loader.config"
import { pathToFileURL } from "url"
import { Worker } from "bullmq"
import chalk from "chalk"
import logger from "../logger"

type WorkerFactory = () => Worker<any, void, string>

const DEFAULT_OPTIONS: LoadOptions = {
  pattern: "**/*.worker",
}
export const startWorkers = async (
  dirname: string,
  options: LoadOptions = DEFAULT_OPTIONS,
) => {
  const pattern = options.pattern + FileExtension(dirname)
  const files = await glob(pattern, {
    cwd: options.path ?? FeaturesDirectory(dirname),
    absolute: true,
  })
  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(file).href
      const module = await import(fileUrl)

      const startWorker = module.default as WorkerFactory

      if (typeof startWorker === "function") {
        startWorker()
        logger.success(
          chalk.magentaBright("Started worker"),
          "from:",
          chalk.gray(path.basename(file)),
        )
      }
    } catch (error) {
      logger.error(
        "Failed to load controller from:",
        path.basename(file),
        error,
      )
    }
  }
}
