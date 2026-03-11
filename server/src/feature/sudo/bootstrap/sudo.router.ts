import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { SharedContainer } from "@shared/bootstrap"
import { AuthContainer, createRequireScope } from "@features/auth"
import { SudoContainer } from "@features/sudo"
import { createInSudoController } from "../controller/in-sudo.controller"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
  sudo: SudoContainer
}
export const useSudoRoutes = ({ app, deps }: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth, sudo } = deps

  router.get(
    "/",
    shared.rateLimits.default,
    auth.authenticate,
    createRequireScope("admin:access"),
    createInSudoController(sudo.sudoService),
  )

  app.use("/v1/session/sudo", router)
}
