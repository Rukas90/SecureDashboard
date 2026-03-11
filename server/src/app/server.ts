import express, { Express } from "express"
import http from "http"
import { extendResponse } from "@shared/config"
import { ILogger } from "@base/shared/logger"

type ShutdownCallback = () => Promise<void>

export default class Server {
  #app: Express
  #server: http.Server | null = null
  #shutdownCallbacks: ShutdownCallback[] = []

  get app() {
    return this.#app
  }
  constructor(private readonly logger: ILogger) {
    this.#app = express()
  }

  onShutdown(callback: ShutdownCallback) {
    this.#shutdownCallbacks.push(callback)
    return this
  }

  initialize() {
    this.#bind()
    this.#configure()
  }

  #bind() {
    process.on("SIGTERM", () => this.#exit("SIGTERM"))
    process.on("SIGINT", () => this.#exit("SIGINT"))
  }
  #exit = async (signal: string) => {
    this.logger.warn(`Received ${signal}`)

    setTimeout(() => {
      this.logger.error("Forcing shutdown")
      process.exit(1)
    }, 10_000)

    try {
      await this.shutdown()
      this.logger.info("Shutdown complete")
    } catch (error) {
      this.logger.error("Error during shutdown:", error)
    } finally {
      process.exit(0)
    }
  }
  #configure() {
    this.#app.use(express.json())
  }
  async start(port: number): Promise<void> {
    if (this.#server) {
      this.logger.warn("Server is already running.")
      return
    }
    this.#server = http.createServer(this.#app)

    await new Promise<void>((resolve) => {
      this.#server!.listen(port, "0.0.0.0", () => {
        this.logger.info(`Server initialized on port ${port}`)
        resolve()
      })
    })
  }
  async shutdown(): Promise<void> {
    if (this.#server == null) {
      this.logger.warn("Shutdown called but server was never started")
      return
    }
    this.logger.info("Shutting down server...")

    await new Promise<void>((resolve) => {
      this.#server!.close(() => {
        this.logger.info("Server has shutdown")
        resolve()
      })
    })
    await Promise.all(this.#shutdownCallbacks.map((cb) => cb()))
  }
}
