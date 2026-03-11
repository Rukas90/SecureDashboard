import { Router } from "express"
import { createValidateBody } from "@shared/middleware"
import { LoginSchema, RegisterSchema, totpCodeSchema } from "@project/shared"
import { createLoginController } from "../controller/login.controller"
import { createRegisterController } from "../controller/register.controller"
import { createLogoutController } from "../controller/logout.controller"
import { createAuthUserController } from "../controller/auth-user.controller"
import { createRefreshController } from "../controller/refresh.controller"
import { SharedContainer } from "@shared/bootstrap"
import AuthContainer from "./auth.container"
import { createRequireScope } from "../middleware/require.scope"
import { createTotpLoginController } from "../controller/totp.login.controller"
import { BaseRoute } from "@shared/base"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
}
export const useAuthRoutes = ({ app, deps }: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth } = deps

  router.post(
    "/login",
    shared.rateLimits.strict,
    shared.csrfValidate,
    shared.captchaValidateToken,
    createValidateBody(LoginSchema),
    createLoginController(
      auth.loginService,
      shared.csrfService,
      auth.cookieService,
    ),
  )
  router.post(
    "/register",
    shared.rateLimits.standard,
    shared.csrfValidate,
    shared.captchaValidateToken,
    createValidateBody(RegisterSchema),
    createRegisterController(
      auth.registerService,
      shared.csrfService,
      auth.cookieService,
    ),
  )
  router.post(
    "/totp/login",
    shared.rateLimits.strict,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("mfa:verify"),
    createValidateBody(totpCodeSchema),
    createTotpLoginController(
      auth.loginService,
      shared.csrfService,
      auth.cookieService,
    ),
  )
  router.post(
    "/logout",
    shared.rateLimits.relaxed,
    shared.csrfValidate,
    createLogoutController(
      auth.logoutService,
      shared.csrfService,
      auth.cookieService,
    ),
  )
  router.get(
    "/session",
    shared.rateLimits.default,
    createAuthUserController(auth.authService, auth.cookieService),
  )
  router.post(
    "/refresh",
    shared.rateLimits.relaxed,
    createRefreshController(auth.authService, auth.cookieService),
  )

  app.use("/v1/auth", router)
}
