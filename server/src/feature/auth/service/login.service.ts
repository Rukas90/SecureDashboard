import { hashing } from "@shared/security"
import { User } from "@prisma/client"
import { Result, VoidResult } from "@project/shared"
import { AuthInvalidCredentialsError } from "../error/auth.error"
import { IUserRepository } from "@features/user"
import { ISessionRevokeService, SessionContext } from "@features/session"
import { IRefreshService } from "@shared/token"
import { IAuthService } from "./auth.service"
import { ITotpService } from "@features/mfa"

export class LoginService {
  constructor(
    private readonly authService: IAuthService,
    private readonly totpService: ITotpService,
    private readonly refreshService: IRefreshService,
    private readonly sessionRevokeService: ISessionRevokeService,
    private readonly userRepository: IUserRepository,
  ) {}

  async totpLogin(
    userId: string,
    isVerified: boolean,
    context: SessionContext,
    code: string,
  ) {
    const verification = await this.totpService.verifyTotpCode(userId, code)
    if (!verification.ok) return verification

    return this.authService.createFullAuthSession({
      userId,
      isVerified,
      context,
    })
  }
  async login(
    email: string,
    password: string,
    oldRefreshToken: string | undefined,
    context: SessionContext,
  ) {
    const user = await this.loginWithCredentials(email, password)
    if (!user.ok) return user

    if (oldRefreshToken) {
      const token = await this.refreshService.findRefreshToken(oldRefreshToken)

      if (token.ok) {
        await this.sessionRevokeService.revokeFamily(token.data.family_id)
      }
    }
    return await this.authService.establishAuthSession({
      userId: user.data.id,
      isVerified: user.data.is_verified,
      context,
    })
  }
  async loginWithCredentials(email: string, password: string) {
    if (!email || !password) {
      return Result.error(new AuthInvalidCredentialsError())
    }
    const user = await this.userRepository.getByEmail(email)

    if (!user.ok || !user.data) {
      return Result.error(new AuthInvalidCredentialsError())
    }
    return await this.loginUserWithPassword(user.data, password)
  }
  async loginUserWithPassword(
    user: User,
    password: string,
  ): Promise<Result<User, AuthInvalidCredentialsError>> {
    if (!user.password_hash) {
      return Result.error(new AuthInvalidCredentialsError())
    }
    const validation = await this.validatePassword(password, user.password_hash)
    if (!validation.ok) {
      return validation
    }
    return Result.success(user)
  }
  async validatePassword(inputPassword: string, hashedPassword: string) {
    return (await hashing.argon2.compare(inputPassword, hashedPassword))
      ? VoidResult.ok()
      : VoidResult.error(new AuthInvalidCredentialsError())
  }
}
export type ILoginService = Pick<LoginService, keyof LoginService>
