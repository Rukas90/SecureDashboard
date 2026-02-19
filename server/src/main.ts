import { server } from "@base/app"
import "dotenv/config"
import dotenv from "dotenv"
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

dotenv.config()

try {
  server.initialize()
} catch {
  server.shutdown()
  throw new Error("App initialization has failed.")
}

const app = server.app
const port = Number.parseInt(process.env.SERVER_PORT ?? "3000", 10)

app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(
  cors({
    origin: ["http://www.127.0.0.1.sslip.io:5173", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", CSRF_HEADER_NAME],
  }),
)
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config().isProduction,
      sameSite: "lax",
      maxAge: ms("15m"),
    },
  }),
)

app.use(initializeCsrf)

await registerRoutes(app)
await startWorkers()
await registerDispatches()

app.use(endpointErrorHandler)

if (config().isDevelopment) {
  useSwaggerDocs(app)
  useScalarDocs(app)
}
await server.start(port)
