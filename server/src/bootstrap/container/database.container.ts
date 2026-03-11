import { Database, Environment } from "@base/app"
import { AppRedis, CloudRedis, SessionRedis } from "@base/redis"
import { UnitOfWork } from "@shared/base"
import { PrismaClient } from "@prisma/client"
import { Logger } from "@shared/logger"

export class DatabaseContainer {
  private readonly database: Database

  readonly cloudRedis: CloudRedis
  readonly appRedis: AppRedis
  readonly sessionRedis: SessionRedis

  readonly unitOfWork: UnitOfWork

  get client(): PrismaClient {
    return this.database.client
  }
  private constructor(
    database: Database,
    cloudRedis: CloudRedis,
    appRedis: AppRedis,
    sessionRedis: SessionRedis,
    unitOfWork: UnitOfWork,
  ) {
    this.database = database
    this.cloudRedis = cloudRedis
    this.appRedis = appRedis
    this.sessionRedis = sessionRedis
    this.unitOfWork = unitOfWork
  }
  static async create(
    logger: Logger,
    environment: Environment,
  ): Promise<DatabaseContainer> {
    const database = new Database(logger)
    await database.connect(environment.get.DATABASE_URL)

    const cloudRedis = new CloudRedis(logger)
    await cloudRedis.connect(environment.get.REDIS_CLOUD_URL)

    const appRedis = new AppRedis(logger)
    await appRedis.connect(
      environment.get.UPSTASH_REDIS_REST_URL,
      environment.get.UPSTASH_REDIS_REST_TOKEN,
    )

    const sessionRedis = new SessionRedis(logger)
    await sessionRedis.connect(environment.get.UPSTASH_REDIS_SESSION_URL)

    const unitOfWork = new UnitOfWork(database.client)

    return new DatabaseContainer(
      database,
      cloudRedis,
      appRedis,
      sessionRedis,
      unitOfWork,
    )
  }
  async dispose() {
    await this.database.disconnect()
    await this.cloudRedis.disconnect()
    this.appRedis.disconnect()
    await this.sessionRedis.disconnect()
  }
}
