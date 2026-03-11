import { authSyncController, AuthRequest } from "@shared/util"
import { Response, NextFunction } from "express"
import { AuthInvalidScopeError } from "../error/auth.error"
import { Scope, ScopeRequirement } from "@project/shared"

export const createRequireScope = (
  scope: Scope[] | Scope,
  requirement: ScopeRequirement = "all",
) =>
  authSyncController((req: AuthRequest, _: Response, next: NextFunction) => {
    const auth = req.session.auth
    const userScopes = auth.claims.scope

    if (!areScopesValid(userScopes, scope, requirement)) {
      return next(new AuthInvalidScopeError())
    }
    next()
  })
const areScopesValid = (
  userScopes: Scope[],
  scope: Scope[] | Scope,
  requirement: ScopeRequirement,
): boolean => {
  if (!Array.isArray(scope)) {
    return userScopes.includes(scope)
  }
  if (scope.length === 0) {
    return true
  }
  switch (requirement) {
    case "all":
      return scope.every((s) => userScopes.includes(s))
    case "any":
      return scope.some((s) => userScopes.includes(s))
  }
}
