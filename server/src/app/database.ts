import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { ILogger } from "@base/shared/logger"

export default class Database {
  #pool: Pool | null = null
  #adapter: PrismaPg | null = null
  #client: PrismaClient | null = null

  constructor(private readonly logger: ILogger) {}

  async connect(connectionString: string): Promise<void> {
    if (this.#client) {
      this.logger.warn("Already connected")
      return
    }
    this.#pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    })
    this.#adapter = new PrismaPg(this.#pool)
    this.#client = new PrismaClient({ adapter: this.#adapter })

    await this.#client.$connect()
    this.logger.info("Database connected")
  }
  async disconnect(): Promise<void> {
    try {
      if (this.#client) {
        await this.#client.$disconnect()
        this.#client = null
      }
      if (this.#pool) {
        await this.#pool.end()
        this.#pool = null
      }
      this.#adapter = null
    } finally {
      this.logger.info("Database disconnected")
    }
  }
  get client(): PrismaClient {
    if (!this.#client) {
      throw new Error("Database not connected. Call connect() first.")
    }
    return this.#client
  }
}
