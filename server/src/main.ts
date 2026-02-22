import { env, server } from "@base/app"
import { endpointErrorHandler } from "@shared/middleware"
import { useScalarDocs } from "./shared/docs/scalar"
import { config } from "@base/app"
import { useSwaggerDocs } from "@shared/docs"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"
import cors from "cors"
import session from "express-session"
import ms from "ms"
import {
  registerDispatches,
  registerRoutes,
  startWorkers,
} from "./shared/loader"
import { initializeCsrf } from "./feature/csrf"
import { CSRF_HEADER_NAME } from "@project/shared"
import { sessionRedis } from "./redis"
import { RedisStore } from "connect-redis"

try {
  server.initialize()
} catch {
  server.shutdown()
  throw new Error("App initialization has failed.")
}

const app = server.app
const port = env.getOr("SERVER_PORT", 3000)

app.use(cookieParser(env.get.COOKIE_SECRET))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: env.getArray("CORS_ORIGINS"),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", CSRF_HEADER_NAME],
  }),
)

const sessionExpiryMs = ms("15m")

let redisStore = new RedisStore({
  client: sessionRedis,
  prefix: "sess:",
  ttl: sessionExpiryMs / 1000,
})
app.use(
  session({
    store: redisStore,
    secret: env.get.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config().isProduction,
      sameSite: "lax",
      maxAge: sessionExpiryMs,
    },
  }),
)

app.use(initializeCsrf)

app.get("/", (_, res) => res.json("Running..."))
app.get("/ping", (_, res) => res.json("pong"))

const dirname = import.meta.dirname

await registerRoutes(app, dirname)
await startWorkers(dirname)
await registerDispatches(dirname)

app.use(endpointErrorHandler)

if (config().isDevelopment) {
  useSwaggerDocs(app)
  useScalarDocs(app)
}
await server.start(port)
