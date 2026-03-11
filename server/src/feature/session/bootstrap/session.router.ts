import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { SharedContainer } from "@shared/bootstrap"
import { AuthContainer, createRequireScope } from "@features/auth"
import { createRevokeSessionController } from "../controller/revoke.controller"
import SessionContainer from "./session.container"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
  session: SessionContainer
}
export const useSessionRoutes = ({
  app,
  deps,
}: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth, session } = deps

  router.delete(
    "/:sessionId",
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createRevokeSessionController(session.revocationService),
  )

  app.use("/v1/session", router)
}
