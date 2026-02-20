import express, { Express } from "express"
import { database } from "src/app/database.js"
import http from "http"
import { extendResponse } from "@shared/config"
import { Mailer } from "@shared/mailer"
import logger from "@shared/logger"
import env from "./env"

class Server {
  #app: Express
  #server: http.Server | null = null

  get app() {
    return this.#app
  }
  constructor() {
    this.#app = express()
  }
  initialize() {
    extendResponse()
    this.#bindShutdownHandlers()
    this.#configureMiddleware()
  }
  #bindShutdownHandlers() {
    process.on("SIGTERM", () => this.#exit("SIGTERM"))
    process.on("SIGINT", () => this.#exit("SIGINT"))
  }
  #exit = async (signal: string) => {
    logger.warn(`Received ${signal}`)

    setTimeout(() => {
      logger.error("Forcing shutdown")
      process.exit(1)
    }, 10_000)

    try {
      await this.shutdown()
      logger.info("Shutdown complete")
    } catch (error) {
      logger.error("Error during shutdown:", error)
    } finally {
      process.exit(0)
    }
  }
  #configureMiddleware() {
    this.#app.use(express.json())
  }
  async start(port: number): Promise<void> {
    if (this.#server) {
      logger.warn("Server is already running.")
      return
    }
    await this.#connectDatabase()

    this.#server = http.createServer(this.#app)
    await new Promise<void>((resolve) => {
      this.#server!.listen(port, "0.0.0.0", () => {
        logger.info(`Server initialized on port ${port}`)
        resolve()
      })
    })
  }
  async #connectDatabase(): Promise<void> {
    try {
      await database.connect(env.get.DATABASE_URL)
      logger.info("Database connected")
    } catch (error) {
      logger.error("Failed to connect to database:", error)
      throw error
    }
  }
  async shutdown(): Promise<void> {
    if (this.#server == null) {
      logger.warn("Shutdown called but server was never started")
      return
    }
    logger.info("Shutting down server...")

    await new Promise<void>((resolve) => {
      this.#server!.close(() => {
        logger.info("Server has shutdown")
        resolve()
      })
    })
    await database.disconnect()
    Mailer.getTransporter().close()
  }
}
export const server = new Server()
