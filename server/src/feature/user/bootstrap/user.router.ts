import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { AuthContainer, createRequireScope } from "@features/auth"
import { SharedContainer } from "@shared/bootstrap"
import { createSendVerificationController } from "../controller/send.email.verify.controller"
import UserContainer from "./user.container"
import { createDeleteAccountController } from "../controller/delete.account.controller"
import { createUserSessionsController } from "../controller/sessions.controller"
import { createPasswordUpdateController } from "../controller/password.update.controller"
import { createUserProfileController } from "../controller/profile.controller"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
  user: UserContainer
}
export const useUserRoutes = ({ app, deps }: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth, user } = deps

  router.get(
    "/profile",
    shared.rateLimits.relaxed,
    auth.authenticate,
    createRequireScope("admin:access"),
    createUserProfileController(user.userService),
  )

  router.post(
    "/password",
    shared.rateLimits.strict,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createPasswordUpdateController(user.userService, shared.csrfService),
  )

  router.get(
    "/sessions",
    shared.rateLimits.relaxed,
    auth.authenticate,
    createRequireScope("admin:access"),
    createUserSessionsController(user.userService),
  )

  router.delete(
    "/",
    shared.rateLimits.standard,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createDeleteAccountController(
      user.userService,
      shared.csrfService,
      auth.cookieService,
    ),
  )

  router.post(
    "/email-verifications",
    shared.rateLimits.standard,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createSendVerificationController(user.userService),
  )

  app.use("/v1/user", router)
}
