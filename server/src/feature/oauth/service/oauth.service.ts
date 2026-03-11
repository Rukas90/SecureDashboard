import { OAuthProvider, Result, VoidResult } from "@project/shared"
import { IOAuthConfigService, OAuthProviderConfig } from "./config.service"
import { OAuth, User } from "@prisma/client"
import { IUserRepository, UserNotFoundError } from "@features/user"
import crypto from "crypto"
import {
  OAuthDisconnectNotPossibleError,
  OAuthEmailNotProvidedError,
  OAuthFailedToAuthenticateError,
  OAuthInvalidStateError,
  OAuthMissingAuthorizationCodeError,
  OAuthProviderNotFoundError,
} from "../error/oauth.error"
import { OAuthSession } from "@shared/util"
import { DatabaseError, UnexpectFailedOperation } from "@shared/errors"
import { IOAuthRepository } from "../repository/oauth.repository"
import { OAuthRes, OAuthTokens, OAuthUserInfo } from "../types/oauth.types"
import { IUnitOfWork } from "@shared/base"
import { IUserInfoService } from "./userInfo.service"
import { ILogger } from "@shared/logger"
import { IAuthService } from "@base/feature/auth"
import { SessionContext } from "@base/feature/session"
import { AppConfig, IEnvironment } from "@base/app"

export type OAuthAuthorization = {
  state: string
  verifier: string
  url: string
}
export class OAuthService {
  private readonly redirectCallbackUrl: string

  constructor(
    private readonly authService: IAuthService,
    private readonly unitOfWork: IUnitOfWork,
    private readonly oauthRepository: IOAuthRepository,
    private readonly userRepository: IUserRepository,
    private readonly userInfoService: IUserInfoService,
    private readonly oauthConfig: IOAuthConfigService,
    private readonly logger: ILogger,
    config: AppConfig,
  ) {
    const redirectUrl = new URL(config.origin.client)
    redirectUrl.pathname = "oauth/callback"

    this.redirectCallbackUrl = redirectUrl.toString()
  }

  getAuthorization(provider: OAuthProvider): OAuthAuthorization {
    const config = this.oauthConfig[provider]

    const { verifier, challenge } = this.generatePKCE()
    const state = this.generateState()

    const params = this.createUrlSearchParams(config, state, challenge)

    return {
      state,
      verifier,
      url: `${config.authUrl}?${params.toString()}`,
    }
  }
  async processCallback(
    provider: OAuthProvider,
    code?: string,
    state?: string,
    session?: OAuthSession,
    context?: SessionContext,
  ) {
    if (!session) {
      return Result.error(new OAuthInvalidStateError())
    }
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
    const oauth = await this.processOAuthRequest(session, code)
    if (!oauth.ok) return oauth

    const auth = await this.authenticateOAuthAccount(
      oauth.data.session,
      oauth.data.userInfo,
    )
    if (!auth.ok) return auth

    const user = auth.data.user

    const sessionInfo = await this.authService.establishAuthSession({
      userId: user.id,
      isVerified: user.is_verified,
      context,
    })
    if (!sessionInfo.ok) return sessionInfo

    return Result.success({
      sessionInfo: sessionInfo.data,
      redirectUrl: this.redirectCallbackUrl,
    })
  }
  private async processOAuthRequest(
    session: OAuthSession,
    code: string,
  ): Promise<
    Result<
      { tokens: OAuthTokens; userInfo: OAuthUserInfo; session: OAuthSession },
      Error
    >
  > {
    const tokenResult = await this.exchangeCodeForToken(
      session.provider,
      code,
      session.verifier,
    )
    if (!tokenResult.ok) {
      return Result.error(tokenResult.error)
    }
    const userInfo = await this.userInfoService.fetchUserInfo(
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
  }
  private async exchangeCodeForToken(
    provider: OAuthProvider,
    code: string,
    codeVerifier: string,
  ): Promise<Result<OAuthTokens, OAuthFailedToAuthenticateError>> {
    const config = this.oauthConfig[provider]

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
        this.logger.error(
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
      this.logger.error(`OAuth token exchange error for ${provider}:`, error)
      return Result.error(new OAuthFailedToAuthenticateError(provider))
    }
  }
  private async authenticateOAuthAccount(
    session: OAuthSession,
    userInfo: OAuthUserInfo,
  ) {
    if (!userInfo.email) {
      return Result.error(new OAuthEmailNotProvidedError())
    }
    let oauthAccount = await Result.valueAsync(
      this.oauthRepository.findByIdAndType(
        userInfo.providerId,
        session.provider,
        {
          user: true,
        },
      ),
    )
    if (!oauthAccount) {
      const newAccount = await this.createOAuthAccount(
        userInfo.email,
        userInfo.emailVerified,
        session.provider,
        userInfo.providerId,
        userInfo.username,
      )
      if (!newAccount.ok) return newAccount

      oauthAccount = newAccount.data
    }
    if (!!userInfo.username && userInfo.username !== oauthAccount.username) {
      await this.oauthRepository.updateUsernameById(
        oauthAccount.id,
        userInfo.username,
      )
    }
    return Result.success(oauthAccount)
  }
  private async createOAuthAccount(
    email: string,
    isVerified: boolean,
    provider: OAuthProvider,
    providerId: string,
    username?: string,
  ): Promise<
    Result<OAuth & { user: User }, DatabaseError | UnexpectFailedOperation>
  > {
    try {
      return this.unitOfWork.run(async (tx) => {
        let user = await Result.valueAsync(
          this.userRepository.getByEmail(email, undefined, tx),
        )
        if (!user) {
          user = await Result.orThrowAsync(
            this.userRepository.create(
              {
                email,
                isVerified,
              },
              tx,
            ),
          )
        }
        if (!user.is_verified && isVerified) {
          await Result.orThrowAsync(this.userRepository.verifyById(user.id, tx))
        }
        return await Result.successOrThrowAsync(
          this.oauthRepository.create(
            user.id,
            provider,
            providerId,
            username,
            tx,
          ),
        )
      })
    } catch {
      return Result.error(new UnexpectFailedOperation("CreateOAuthAccount"))
    }
  }
  private generateState() {
    return crypto.randomBytes(32).toString("base64url")
  }
  private generatePKCE() {
    const verifier = crypto.randomBytes(32).toString("base64url")
    const challenge = crypto
      .createHash("sha256")
      .update(verifier)
      .digest("base64url")

    return { verifier, challenge }
  }
  async disconnectOAuthProvider(userId: string, provider: OAuthProvider) {
    const user = await this.userRepository.getById(userId, { oauths: true })

    if (!user.ok) return user
    if (!user.data) return VoidResult.error(new UserNotFoundError())

    const oauth = user.data.oauths.find((o) => o.provider === provider)

    if (!oauth) {
      return VoidResult.error(new OAuthProviderNotFoundError(provider))
    }
    const remainingOAuthCount = user.data.oauths.length - 1
    const hasPassword = !!user.data.password_hash

    if (!hasPassword && remainingOAuthCount === 0) {
      return VoidResult.error(new OAuthDisconnectNotPossibleError(provider))
    }
    const deletion = await this.oauthRepository.deleteById(oauth.id)
    if (!deletion.ok) return deletion

    return VoidResult.ok()
  }
  private createUrlSearchParams(
    config: OAuthProviderConfig,
    state: string,
    codeChallenge: string,
  ): URLSearchParams {
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
}
export type IOAuthService = Pick<OAuthService, keyof OAuthService>

/*
const oauthService = {
  createOAuthAccount: async (
    email: string,
    isVerified: boolean,
    provider: OAuthProvider,
    providerId: string,
    username?: string,
  ): Promise<Result<OAuth & { user: User }, DatabaseError>> =>
    Result.tryCatchAsync(
      () =>
        database.client.$transaction(async (client) => {
          let user = await Result.valueAsync(
            userRepository.getByEmailOrError(email, undefined, client),
          )
          if (!user) {
            user = await Result.orThrowAsync(
              userRepository.create(email, isVerified, client),
            )
          }
          if (!user.is_verified && isVerified) {
            await Result.orThrowAsync(
              userRepository.verifyUser(user.id, client),
            )
          }
          return await Result.successOrThrowAsync(
            oauthRepository.create(
              user.id,
              provider,
              providerId,
              username,
              client,
            ),
          )
        }),
      () => new UnexpectFailedOperation("Create_OAuth_Account"),
    ),
}*/
