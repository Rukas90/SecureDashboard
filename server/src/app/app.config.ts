import { IEnvironment } from "./env"

type NodeEnv = "production" | "development"

export default class AppConfig {
  name: string
  env: NodeEnv
  origin: { api: string; client: string }
  domain: string | undefined
  isProduction: boolean
  isDevelopment: boolean

  constructor(environment: IEnvironment) {
    this.name = environment.getOr("APP_NAME", "MyApp")
    this.env = environment.get.NODE_ENV as NodeEnv

    const apiOrigin = environment.get.API_ORIGIN
    const clientOrigin = environment.get.CLIENT_ORIGIN

    if (!apiOrigin || !clientOrigin) {
      throw new Error("API_ORIGIN and/or CLIENT_ORIGIN is not defined.")
    }
    this.origin = { api: apiOrigin, client: clientOrigin }

    this.domain = environment.getOptional("DOMAIN")

    this.isProduction = environment.get.NODE_ENV === "production"
    this.isDevelopment = environment.get.NODE_ENV === "development"
  }
  /**
   * Builds an absolute URL from a path and a target origin.
   *
   * @param path - The path to append.
   * @param target - The origin to use, either "api" or "client". Defaults to "api".
   * @returns The full absolute URL as a string.
   */
  buildUrl(path: string, target: "api" | "client" = "api") {
    const base = target === "api" ? this.origin.api : this.origin.client
    return new URL(path, base).href
  }
}
