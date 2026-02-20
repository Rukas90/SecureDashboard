import { csrfService, generateCsrfCookie } from "@features/csrf"
import { OAuthProvider, Result } from "@project/shared"
import { asyncRoute, authRoute, OAuthSession } from "@shared/util"
import { Request, Response, NextFunction } from "express"
import oauthService from "../service/oauth.service"
import {
  OAuthInvalidStateError,
  OAuthMissingAuthorizationCodeError,
} from "../error/oauth.error"
import { authService, setAuthSessionCookies } from "@features/auth"
import { extractSessionContext } from "@features/session"
import { env } from "@base/app"

export const initiateOAuth = asyncRoute(
  async (req: Request, res: Response, _: NextFunction) => {
    const provider = req.params.provider as OAuthProvider

    const state = csrfService.generateCsrfToken()
    const { verifier, challenge } = oauthService.generatePKCE()

    req.session.oauth = {
      state,
      verifier,
      provider,
    }
    res.redirect(oauthService.getAuthorizationUrl(provider, state, challenge))
  },
)

export const handleOAuthCallback = asyncRoute(
  async (req: Request, res: Response, next: NextFunction) => {
    const session = validateCallbackRequest(req)

    if (!session.ok) {
      return Result.error(session.error)
    }
    const oauth = await oauthService.processOAuthRequest(session.data)

    if (!oauth.ok) {
      return next(oauth.error)
    }
    const auth = await oauthService.authenticateOAuthAccount(
      oauth.data.session,
      oauth.data.userInfo,
    )
    if (!auth.ok) {
      return next(auth.error)
    }
    const { accessToken, refreshToken, authUser } =
      await authService.establishUserAuthSession(
        auth.data.user,
        extractSessionContext(req),
      )
    setAuthSessionCookies(res, accessToken, refreshToken, authUser)

    const url = new URL(env.get.CLIENT_ORIGIN)
    url.pathname = "oauth/callback"

    generateCsrfCookie(res)
    res.redirect(url.toString())
  },
)

export const validateCallbackRequest = (
  req: Request,
): Result<OAuthSession & { code: string }, Error> => {
  const provider = req.params.provider as OAuthProvider
  const code = req.query.code as string | undefined
  const state = req.query.state as string | undefined

  if (!req.session.oauth) {
    return Result.error(new OAuthInvalidStateError())
  }
  const session: OAuthSession = {
    state: req.session.oauth.state,
    verifier: req.session.oauth.verifier,
    provider: req.session.oauth.provider,
  }
  delete req.session.oauth

  if (session.provider !== provider) {
    return Result.error(new OAuthInvalidStateError())
  }
  if (!state || !session.state || state !== session.state) {
    return Result.error(new OAuthInvalidStateError())
  }
  if (!code || typeof code !== "string") {
    return Result.error(new OAuthMissingAuthorizationCodeError())
  }
  if (!session.verifier) {
    return Result.error(new OAuthInvalidStateError())
  }
  return Result.success({ ...session, code })
}
export const disconnectOAuthMethodHandler = authRoute(
  async (req, res, next) => {
    const userId = req.session.auth.userId
    const provider = req.params.provider as OAuthProvider

    const disconnect = await oauthService.disconnectOAuthProvider(
      userId,
      provider,
    )

    if (!disconnect.ok) {
      return next(disconnect.error)
    }
    res.ok("Disconnected OAuth provider from user successfully.")
  },
)
