import { Express } from "express"
import { glob } from "glob"
import path from "path"
import { FeaturesDirectory, LoadOptions } from "./loader.config"
import { pathToFileURL } from "url"
import chalk from "chalk"
import logger from "../logger"
import { config } from "@base/app"

type RouteRegistrar = (app: Express) => void

const DEFAULT_OPTIONS: LoadOptions = {
  pattern: "**/*.controller",
}
export const registerRoutes = async (
  app: Express,
  options: LoadOptions = DEFAULT_OPTIONS,
) => {
  const pattern = options.pattern + (config().isProduction ? ".js" : ".ts")
  const files = await glob(pattern, {
    cwd: options.path ?? FeaturesDirectory,
    absolute: true,
  })
  for (const file of files) {
    try {
      const fileUrl = pathToFileURL(file).href
      const module = await import(fileUrl)

      const useRoutes = module.default as RouteRegistrar

      if (typeof useRoutes === "function") {
        useRoutes(app)
        logger.success(
          chalk.cyanBright("Registered routes"),
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
