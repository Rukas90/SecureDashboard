import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { SharedContainer } from "@shared/bootstrap"
import { AuthContainer, createRequireScope } from "@features/auth"
import { createUserEnrollmentsController } from "../controller/user.enrollments.controller"
import MfaContainer from "./mfa.container"
import { createTotpInitializeController } from "../controller/totp.initialize.controller"
import { createValidateBody } from "@shared/middleware"
import { totpCodeSchema } from "@project/shared"
import { createTotpConfirmController } from "../controller/totp.confirm.controller"
import { createTotpRevokeController } from "../controller/totp.revoke.controller"
import { SudoContainer } from "@features/sudo"
import { createRegenerateCodesController } from "../controller/regenerate.codes.controller"

interface RoutesDependencies {
  shared: SharedContainer
  mfa: MfaContainer
  auth: AuthContainer
  sudo: SudoContainer
}
export const useMfaRoutes = ({ app, deps }: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, mfa, auth, sudo } = deps

  router.get(
    "/enrollments",
    shared.rateLimits.relaxed,
    auth.authenticate,
    createRequireScope(["admin:access", "mfa:verify"], "any"),
    createUserEnrollmentsController(mfa.mfaService),
  )
  router.post(
    "/totp/initialize",
    shared.rateLimits.standard,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createTotpInitializeController(mfa.totpService),
  )
  router.post(
    "/totp/confirm",
    shared.rateLimits.standard,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createValidateBody(totpCodeSchema),
    createTotpConfirmController(mfa.totpService),
  )
  router.post(
    "/totp/revoke",
    shared.rateLimits.strict,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    createValidateBody(totpCodeSchema),
    createTotpRevokeController(mfa.totpService),
  )
  router.post(
    "/recovery-codes/regenerate",
    shared.rateLimits.strict,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    sudo.requiresSudo,
    createRegenerateCodesController(mfa.recoveryService),
  )

  app.use("/v1/mfa", router)
}
