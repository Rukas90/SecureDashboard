export { createRequireScope } from "./middleware/require.scope"
export { createAuthenticateRequest } from "./middleware/authenticate"
export {
  RegisterService,
  type IRegisterService,
} from "./service/register.service"
export { LoginService, type ILoginService } from "./service/login.service"
export { AuthService, type IAuthService } from "./service/auth.service"
export {
  RevocationCache,
  type IRevocationCache,
} from "../session/repository/revocation.repository"
export {
  AuthUnauthenticatedError,
  AuthInvalidSessionError,
} from "./error/auth.error"
export { default as AuthContainer } from "./bootstrap/auth.container"
export { useAuthRoutes } from "./bootstrap/auth.router"
export {
  AuthCookieService,
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "./service/cookie.service"
