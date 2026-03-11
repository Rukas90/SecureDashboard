import { Express } from "express"
import { AppContainers } from "./app.modules"
import { useAuthRoutes } from "@features/auth"
import { useMfaRoutes } from "@features/mfa"
import { useOAuthRoutes } from "@features/oauth"
import { useReauthRoutes } from "@features/reauth"
import { useSessionRoutes } from "@features/session"
import { useUserRoutes } from "@features/user"
import { useVerificationRoutes } from "@features/verification"
import chalk from "chalk"
import { useSudoRoutes } from "@base/feature/sudo"

export const useAppRoutes = (app: Express, containers: AppContainers) => {
  const {
    core,
    shared,
    verification,
    auth,
    mfa,
    oauth,
    reauth,
    sudo,
    session,
    user,
  } = containers

  useAuthRoutes({
    app,
    deps: {
      shared,
      auth,
    },
  })
  useMfaRoutes({
    app,
    deps: {
      shared,
      mfa,
      auth,
      sudo,
    },
  })
  useOAuthRoutes({
    app,
    deps: {
      shared,
      auth,
      oauth,
    },
  })
  useReauthRoutes({
    app,
    deps: {
      shared,
      auth,
      reauth,
    },
  })
  useSessionRoutes({
    app,
    deps: {
      shared,
      auth,
      session,
    },
  })
  useUserRoutes({
    app,
    deps: {
      shared,
      auth,
      user,
    },
  })
  useVerificationRoutes({
    app,
    deps: {
      core,
      shared,
      auth,
      verification,
    },
  })
  useSudoRoutes({
    app,
    deps: {
      shared,
      auth,
      sudo,
    },
  })
  core.logger.success(chalk.green("Registered"), "app routes")
}
