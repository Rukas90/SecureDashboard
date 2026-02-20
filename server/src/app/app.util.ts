type NodeEnv = "production" | "development"

class AppConfig {
  name: string
  env: NodeEnv
  origin: { api: string; client: string }
  isProduction: boolean
  isDevelopment: boolean

  constructor() {
    this.name = process.env.APP_NAME ?? "MyApp"
    this.env = process.env.NODE_ENV as NodeEnv

    const apiOrigin = process.env.API_ORIGIN
    const clientOrigin = process.env.CLIENT_ORIGIN

    if (!apiOrigin || !clientOrigin) {
      throw new Error("API_ORIGIN and/or CLIENT_ORIGIN is not defined.")
    }
    this.origin = { api: apiOrigin, client: clientOrigin }

    this.isProduction = process.env.NODE_ENV === "production"
    this.isDevelopment = process.env.NODE_ENV === "development"
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
