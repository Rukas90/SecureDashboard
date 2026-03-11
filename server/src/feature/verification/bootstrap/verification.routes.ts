import { createValidateBody } from "@shared/middleware"
import { AuthContainer, createRequireScope } from "@features/auth"
import { BaseRoute } from "@shared/base"
import { Router } from "express"
import { verifyCodeSchema } from "@project/shared"
import { createVerifyCodeController } from "../controller/verify.code.controller"
import VerificationContainer from "./verification.container"
import { SharedContainer } from "@base/shared/bootstrap"
import { createVerifyTokenController } from "../controller/verify.token.controller"
import { CoreContainer } from "@base/bootstrap"

interface RoutesDependencies {
  core: CoreContainer
  shared: SharedContainer
  auth: AuthContainer
  verification: VerificationContainer
}
export const useVerificationRoutes = ({
  app,
  deps,
}: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { core, shared, auth, verification } = deps

  router.post(
    "/code",
    shared.rateLimits.strict,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createValidateBody(verifyCodeSchema),
    createVerifyCodeController(verification.verificationService),
  )
  router.get(
    "/token",
    shared.rateLimits.standard,
    createVerifyTokenController(verification.verificationService, core.config),
  )

  app.use("/v1/verify", router)
}
