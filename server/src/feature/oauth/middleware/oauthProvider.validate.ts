import { Request, Response, NextFunction } from "express"
import { syncController } from "@shared/util"
import { OAuthProvider, OAuthProviderCollection } from "@project/shared"
import { OAuthInvalidProviderError } from "../error/oauth.error"

const createValidateOAuthProvider = () =>
  syncController((req: Request, _: Response, next: NextFunction) => {
    const provider = req.params.provider as OAuthProvider

    if (!provider || !OAuthProviderCollection.includes(provider)) {
      return next(new OAuthInvalidProviderError(provider))
    }
    req.params.provider = provider

    next()
  })
export default createValidateOAuthProvider
