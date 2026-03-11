import { Router } from "express"
import { BaseRoute } from "@shared/base"
import { SharedContainer } from "@shared/bootstrap"
import { AuthContainer, createRequireScope } from "@features/auth"
import { createOAuthInitiateController } from "../controller/initiate.controller"
import OAuthContainer from "./oauth.container"
import { createOAuthCallbackController } from "../controller/callback.controller"
import { createOAuthDisconnectController } from "../controller/disconnect.controller"

interface RoutesDependencies {
  shared: SharedContainer
  auth: AuthContainer
  oauth: OAuthContainer
}
export const useOAuthRoutes = ({
  app,
  deps,
}: BaseRoute<RoutesDependencies>) => {
  const router = Router()

  const { shared, auth, oauth } = deps

  router.get(
    "/:provider",
    shared.rateLimits.standard,
    oauth.validateOAuthProvider,
    createOAuthInitiateController(oauth.oauthService),
  )
  router.get(
    "/:provider/callback",
    shared.rateLimits.strict,
    createOAuthCallbackController(
      oauth.oauthService,
      shared.csrfService,
      auth.cookieService,
    ),
  )
  router.post(
    "/:provider/disconnect",
    shared.rateLimits.standard,
    shared.csrfValidate,
    auth.authenticate,
    createRequireScope("admin:access"),
    oauth.validateOAuthProvider,
    createOAuthDisconnectController(oauth.oauthService),
  )

  app.use("/v1/oauth", router)
}
