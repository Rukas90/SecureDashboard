import { config } from "@base/app"
import path from "path"

export const FeaturesDirectory = path.join(
  process.cwd(),
  config().isProduction ? "dist/feature" : "src/feature",
)

export type LoadOptions = {
  pattern: string
  path?: string
}
