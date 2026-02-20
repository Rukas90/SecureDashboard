import env from "./env"

type NodeEnv = "production" | "development"

class AppConfig {
  name: string
  env: NodeEnv
  origin: { api: string; client: string }
  isProduction: boolean
  isDevelopment: boolean

  constructor() {
    this.name = env.getOr("APP_NAME", "MyApp")
    this.env = env.get.NODE_ENV as NodeEnv

    const apiOrigin = env.get.API_ORIGIN
    const clientOrigin = env.get.CLIENT_ORIGIN

    if (!apiOrigin || !clientOrigin) {
      throw new Error("API_ORIGIN and/or CLIENT_ORIGIN is not defined.")
    }
    this.origin = { api: apiOrigin, client: clientOrigin }

    this.isProduction = env.get.NODE_ENV === "production"
    this.isDevelopment = env.get.NODE_ENV === "development"
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
let instance: AppConfig | null = null

export const config = () => {
  if (!instance) {
    instance = new AppConfig()
  }
  return instance
}
