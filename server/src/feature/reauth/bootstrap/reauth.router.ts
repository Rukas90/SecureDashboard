import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { SharedContainer } from "@shared/bootstrap"
import { AuthContainer, createRequireScope } from "@features/auth"
import { createReauthTotpController } from "../controller/verify.totp.controller"
import { createReauthPasswordController } from "../controller/verify.password.controller"
import { createReauthSendEmailController } from "../controller/verify.send-email.controller"
import ReauthContainer from "./reauth.container"
import { createValidateBody } from "@shared/middleware"
import { totpCodeSchema } from "@project/shared"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
  reauth: ReauthContainer
}
export const useReauthRoutes = ({
  app,
  deps,
}: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth, reauth } = deps

  router.post(
    "/totp",
    shared.rateLimits.strict,
    auth.authenticate,
    createRequireScope("admin:access"),
    createValidateBody(totpCodeSchema),
    createReauthTotpController(reauth.reauthService),
  )
  router.post(
    "/password",
    shared.rateLimits.strict,
    auth.authenticate,
    createRequireScope("admin:access"),
    createReauthPasswordController(reauth.reauthService),
  )
  router.post(
    "/email/send",
    shared.rateLimits.standard,
    auth.authenticate,
    createRequireScope("admin:access"),
    createReauthSendEmailController(reauth.reauthService),
  )

  app.use("/v1/reauth", router)
}
