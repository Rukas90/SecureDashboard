import {
  OAuthProvider,
  PasswordSetSchema,
  PasswordUpdateSchema,
  Result,
  VoidResult,
} from "@project/shared"
import {
  UserEmailVerificationCooldownError,
  UserFailedToDeleteError,
  UserNotFoundError,
} from "../error/user.error"
import { ISessionService } from "@features/session"
import { IRefreshService } from "@shared/token"
import { AuthUnauthenticatedError, ILoginService } from "@features/auth"
import ms from "ms"
import { IUserRepository } from "../repository/user.repository"
import z from "zod"
import { ValidationError } from "@shared/errors"
import { hashing } from "@shared/security"
import { IVerifyUserEvent } from "../event/verify-email.event"

const RETRY_EMAIL_VERIFY_TIMEOUT_DELAY = ms("5m")

export type PasswordUpdateBody = z.infer<typeof PasswordUpdateSchema>
export type PasswordSetBody = z.infer<typeof PasswordSetSchema>
export type PasswordUpdateOrSetBody = PasswordUpdateBody | PasswordSetBody

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly sessionService: ISessionService,
    private readonly refreshService: IRefreshService,
    private readonly verifyUserEvent: IVerifyUserEvent,
  ) {}

  async updatePassword(userId: string, data: PasswordUpdateOrSetBody) {
    const user = await this.userRepository.getById(userId)
    if (!user.ok) return user

    if (!user.data) {
      return Result.error(new UserNotFoundError())
    }
    const hasPassword = !!user.data.password_hash
    const schema = hasPassword ? PasswordUpdateSchema : PasswordSetSchema
    const validation = await schema.safeParseAsync(data)

    if (!validation.success) {
      const error = validation.error.issues[0]
      return Result.error(new ValidationError(error.message, error.code))
    }
    if (hasPassword) {
      const isPasswordCorrect = await hashing.argon2.compare(
        (data as PasswordUpdateBody).currentPassword,
        user.data.password_hash!,
      )
      if (!isPasswordCorrect) {
        return Result.error(new AuthUnauthenticatedError()) // TODO: Replace with other error (AccessForbidden instead. This is a special error type)
      }
    }
    const passwordHash = await hashing.argon2.hash(data.password)
    const updateResult = await this.userRepository.updatePasswordById(
      userId,
      passwordHash,
    )

    if (!updateResult.ok) return updateResult
    return VoidResult.ok()
  }
  async getUserSessions(userId: string, refreshToken: string) {
    const currentToken =
      await this.refreshService.findRefreshToken(refreshToken)

    if (!currentToken.ok) {
      return Result.error(new AuthUnauthenticatedError()) // TODO: Replace with other error (AccessForbidden instead. This is a special error type)
    }
    return await this.sessionService.getSessions(
      userId,
      currentToken.data.family_id,
    )
  }
  async deleteUser(userId: string) {
    const result = await this.userRepository.deleteById(userId)
    if (!result.ok) return VoidResult.error(new UserFailedToDeleteError())

    return VoidResult.ok()
  }
  async sendEmailVerification(userId: string) {
    const user = await this.userRepository.getById(userId, {
      verifications: true,
    })

    if (!user.ok) return user
    if (!user.data) return VoidResult.error(new UserNotFoundError())

    const latest = user.data.verifications
      .filter((v) => v.event_type === this.verifyUserEvent.name)
      .reduce<
        (typeof user.data.verifications)[number] | null
      >((a, b) => (!a || b.created_at > a.created_at ? b : a), null)

    if (latest) {
      const retryAt =
        latest.created_at.getTime() + RETRY_EMAIL_VERIFY_TIMEOUT_DELAY

      if (retryAt > Date.now()) {
        return VoidResult.error(
          new UserEmailVerificationCooldownError(retryAt - Date.now()),
        )
      }
    }
    await this.createEmailVerifyVerification(user.data.id, user.data.email)
    return Result.success({
      retryAfterMs: RETRY_EMAIL_VERIFY_TIMEOUT_DELAY,
    })
  }
  async getProfile(userId: string) {
    const user = await this.userRepository.getById(userId, {
      oauths: {
        select: { provider: true, username: true },
      },
    })
    if (!user.ok) return user
    if (!user.data) {
      return Result.error(new UserNotFoundError())
    }
    return Result.success({
      email: user.data.email,
      verifiedEmail: user.data.is_verified,
      hasPassword: user.data.password_hash !== null,
      signInMethods: user.data.oauths.map((a) => {
        return {
          provider: a.provider as OAuthProvider,
          username: a.username ?? "",
        }
      }),
    })
  }
  async createEmailVerifyVerification(userId: string, email: string) {
    this.verifyUserEvent.invoke({
      userId,
      payload: undefined,
      expiresMs: ms("10m"),
      type: "token",
      mailOptions: {
        recipient: email,
        subject: "Verify your account email",
      },
    })
  }
}
export type IUserService = Pick<UserService, keyof UserService>
