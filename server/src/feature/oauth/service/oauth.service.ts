import { OAuthProvider, Result, VoidResult } from "@project/shared"
import { OAuthConfig, oauthConfig } from "../config/oauth.config"
import { OAuth, User } from "@prisma/client"
import { database } from "@base/app"
import { userService } from "@features/user"
import crypto from "crypto"
import {
  OAuthDisconnectNotPossibleError,
  OAuthEmailNotProvidedError,
  OAuthFailedToAuthenticateError,
  OAuthProviderNotFoundError,
} from "../error/oauth.error"
import { OAuthSession } from "@shared/util"
import userInfoService from "./userInfo.service"
import logger from "@shared/logger"

export type OAuthTokens = {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  scope?: string
}
export type OAuthUserInfo = {
  providerId: string
  email: string
  name: string
  emailVerified: boolean
  username?: string
}

interface OAuthRes {
  access_token: string
  refresh_token: string
  expires_in: number
  scope: string
}

const oauthService = {
  getAuthorizationUrl: (
    provider: OAuthProvider,
    state: string,
    codeChallenge: string,
  ) => {
    const config = oauthConfig[provider]
    const params = createUrlSearchParams(config, state, codeChallenge)

    return `${config.authUrl}?${params.toString()}`
  },
  processOAuthRequest: async (
    session: OAuthSession & { code: string },
  ): Promise<
    Result<
      { tokens: OAuthTokens; userInfo: OAuthUserInfo; session: OAuthSession },
      Error
    >
  > => {
    const tokenResult = await oauthService.exchangeCodeForToken(
      session.provider,
      session.code,
      session.verifier,
    )
    if (!tokenResult.ok) {
      return Result.error(tokenResult.error)
    }
    const userInfo = await userInfoService.fetchUserInfo(
      session.provider,
      tokenResult.data.accessToken,
    )
    if (!userInfo.ok) {
      return Result.error(userInfo.error)
    }
    return Result.success({
      tokens: tokenResult.data,
      userInfo: userInfo.data,
      session: session,
    })
  },
  exchangeCodeForToken: async (
    provider: OAuthProvider,
    code: string,
    codeVerifier: string,
  ): Promise<Result<OAuthTokens, OAuthFailedToAuthenticateError>> => {
    const config = oauthConfig[provider]

    try {
      const body = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.redirectUri,
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
      })
      const response = await fetch(config.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body,
      })
      if (!response.ok) {
        logger.error(
          `OAuth token exchange error for ${provider}:`,
          await response.text(),
        )
        return Result.error(new OAuthFailedToAuthenticateError(provider))
      }
      const data = (await response.json()) as OAuthRes

      return Result.success({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      })
    } catch (error) {
      logger.error(`OAuth token exchange error for ${provider}:`, error)
      return Result.error(new OAuthFailedToAuthenticateError(provider))
    }
  },
  authenticateOAuthAccount: async (
    session: OAuthSession,
    userInfo: OAuthUserInfo,
  ): Promise<Result<OAuth & { user: User }, Error>> => {
    if (!userInfo.email) {
      return Result.error(new OAuthEmailNotProvidedError())
    }
    let oauthAccount = await oauthService.getOAuthAccount(
      userInfo.providerId,
      session.provider,
    )
    if (!oauthAccount) {
      oauthAccount = await oauthService.createOAuthAccount(
        userInfo.email,
        userInfo.emailVerified,
        session.provider,
        userInfo.providerId,
        userInfo.username,
      )
    }
    if (!!userInfo.username && userInfo.username !== oauthAccount.username) {
      await oauthService.updateOAuthUsername(oauthAccount.id, userInfo.username)
    }
    return Result.success(oauthAccount)
  },
  getOAuthAccount: async (
    providerId: string,
    provider: OAuthProvider,
  ): Promise<(OAuth & { user: User }) | null> => {
    return await database.client.oAuth.findUnique({
      where: {
        provider_provider_id: {
          provider,
          provider_id: providerId,
        },
      },
      include: { user: true },
    })
  },
  createOAuthAccount: async (
    email: string,
    isVerified: boolean,
    provider: OAuthProvider,
    providerId: string,
    username?: string,
  ): Promise<OAuth & { user: User }> => {
    const userResult = await userService.getUserByEmail(email)
    let user = userResult.ok ? userResult.data : null

    if (!user) {
      user = await userService.createNewUser(email, isVerified)
    }
    if (!user.is_verified && isVerified) {
      await userService.verifyUser(user.id)
    }
    return await database.client.oAuth.create({
      data: {
        user_id: user.id,
        provider,
        provider_id: providerId,
        username: username,
      },
      include: {
        user: true,
      },
    })
  },
  updateOAuthUsername: async (oauthId: string, username: string) => {
    await database.client.oAuth.update({
      where: {
        id: oauthId,
      },
      data: {
        username,
      },
    })
  },
  generatePKCE: () => {
    const verifier = crypto.randomBytes(32).toString("base64url")
    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url")

    return { verifier, challenge }
  },
  disconnectOAuthProvider: async (userId: string, provider: OAuthProvider) => {
    const user = await userService.getUserById(userId, { oauths: true })

    if (!user.ok) {
      return VoidResult.error(user.error)
    }
    const oauth = user.data.oauths.find((o) => o.provider === provider)

    if (!oauth) {
      return VoidResult.error(new OAuthProviderNotFoundError(provider))
    }
    const remainingOAuthCount = user.data.oauths.length - 1
    const hasPassword = !!user.data.password_hash

    if (!hasPassword && remainingOAuthCount === 0) {
      return VoidResult.error(new OAuthDisconnectNotPossibleError(provider))
    }
    await database.client.oAuth.delete({
      where: {
        id: oauth.id,
      },
    })
    return VoidResult.ok()
  },
}

const createUrlSearchParams = (
  config: OAuthConfig,
  state: string,
  codeChallenge: string,
): URLSearchParams => {
  return new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "consent",
  })
}

export default oauthService
