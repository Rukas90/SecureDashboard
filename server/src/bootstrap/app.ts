import { Server } from "@base/app"
import { AppDeps } from "./container/app.modules"
import { useAppRoutes } from "./container/routes"
import { CSRF_HEADER_NAME, HealthResponse } from "@project/shared"
import { RedisStore } from "connect-redis"
import helmet from "helmet"
import cors from "cors"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import session from "express-session"
import ms from "ms"
import { useScalarDocs, useSwaggerDocs } from "@base/shared/docs"
import { extendResponse } from "@shared/config"
import { createEndpointErrorHandler } from "@shared/middleware"

export class App {
  private deps!: AppDeps
  private server!: Server

  private get containers() {
    return this.deps.containers
  }
  async build() {
    this.deps = await AppDeps.create()

    const { core } = this.containers

    this.server = new Server(core.logger)
    this.server.initialize()

    this.setupAppMiddleware()

    const app = this.server.app

    useAppRoutes(app, this.containers)

    app.get("/health", (_, res) =>
      res.ok({ status: "ok" } satisfies HealthResponse),
    )
    app.use(createEndpointErrorHandler(core.config, core.logger))

    if (core.config.isDevelopment) {
      useSwaggerDocs(app)
      useScalarDocs(app)
    }
  }
  private setupAppMiddleware() {
    const app = this.server.app
    const { environment, config } = this.containers.core

    extendResponse(environment, config)

    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
        },
        frameguard: { action: "deny" },
        referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      }),
    )

    app.set("trust proxy", 1)

    app.use(
      cors({
        origin: environment.getArray("CORS_ORIGINS"),
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", CSRF_HEADER_NAME],
      }),
    )
    app.use(cookieParser(environment.get.COOKIE_SECRET))
    app.use(bodyParser.json({ limit: "50kb" }))
    app.use(bodyParser.urlencoded({ limit: "50kb", extended: true }))

    const sessionExpiryMs = ms("15m")

    let redisStore = new RedisStore({
      client: this.containers.database.sessionRedis.client,
      prefix: "sess:",
      ttl: sessionExpiryMs / 1000,
    })
    app.use(
      session({
        store: redisStore,
        secret: environment.get.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: config.isProduction,
          sameSite: "lax",
          maxAge: sessionExpiryMs,
        },
      }),
    )

    app.use(this.containers.shared.csrfInitialize)
  }
  async start() {
    const { environment } = this.containers.core
    const port = environment.getOr("SERVER_PORT", 3000)
    return await this.server.start(port)
  }
}
