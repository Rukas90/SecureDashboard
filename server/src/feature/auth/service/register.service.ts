import {
  AuthEmailAlreadyExistError,
  AuthRegistrationFailedError,
} from "../error/auth.error"
import { Result } from "@project/shared"
import { hashing } from "@shared/security"
import { IUserRepository, IUserService } from "@features/user"
import { UniqueConstraintError } from "@shared/errors"
import { IAuthService } from "./auth.service"
import { wrap } from "@shared/base"
import { SessionContext } from "@features/session"

export class RegisterService {
  constructor(
    private readonly userService: IUserService,
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
  ) {}

  async register(email: string, password: string, context: SessionContext) {
    const user = await this.createNewUser(email, password)
    if (!user.ok) return user

    await this.userService.createEmailVerifyVerification(
      user.data.id,
      user.data.email,
    )
    const info = await this.authService.createFullAuthSession({
      userId: user.data.id,
      isVerified: false,
      context,
    })
    if (!info.ok) return info

    return Result.success(info.data)
  }
  async createNewUser(email: string, password: string) {
    const passwordHash = await hashing.argon2.hash(password)
    return await Result.orErrAsync(
      this.userRepository.create({
        email,
        isVerified: false,
        passwordHash,
      }),
      (error) => {
        if (error instanceof UniqueConstraintError) {
          return Result.error(new AuthEmailAlreadyExistError())
        }
        return Result.error(new AuthRegistrationFailedError())
      },
    )
  }
}
export type IRegisterService = Pick<RegisterService, keyof RegisterService>
