import { ILoginService } from "@features/auth"
import { ITotpService, IEnrollmentRepository } from "@features/mfa"
import { IUserRepository } from "@features/user"
import { Result, SudoEmailSent, VoidResult } from "@project/shared"
import ms from "ms"
import { NUMERIC_CODE_PATTERN } from "@features/verification"
import { ISudoActivateEvent } from "../event/sudo-activate.event"
import { ISudoService } from "@features/sudo"
import { SudoVerificationError } from "../error/reauth.error"

interface SudoVerification<TData> {
  userId: string
  sid?: string
  data: TData
}
export class ReauthService {
  constructor(
    private readonly totpService: ITotpService,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userRepository: IUserRepository,
    private readonly loginService: ILoginService,
    private readonly sudoService: ISudoService,
    private readonly sudoActivateEvent: ISudoActivateEvent,
  ) {}

  async verifyTotp({ userId, sid, data }: SudoVerification<{ code: string }>) {
    if (!sid) return Result.error(new SudoVerificationError())

    const verification = await this.totpService.verifyTotpCode(
      userId,
      data.code,
    )
    if (!verification.ok) {
      return VoidResult.error(new SudoVerificationError())
    }
    await this.sudoService.activateSudo(sid)
    return VoidResult.ok()
  }
  async verifyPassword({
    userId,
    sid,
    data,
  }: SudoVerification<{ password: string }>) {
    if (!sid) return Result.error(new SudoVerificationError())

    const enrollments =
      await this.enrollmentRepository.findAllConfiguredByUserId(userId)

    if (!enrollments.ok || enrollments.data.length > 0) {
      // Cannot verify with password when any MFA enrollment is configured and active
      return Result.error(new SudoVerificationError())
    }
    const user = await this.userRepository.getById(userId)
    if (!user.ok || !user.data) {
      return Result.error(new SudoVerificationError())
    }
    const login = await this.loginService.loginUserWithPassword(
      user.data,
      data.password,
    )
    if (!login.ok) {
      return Result.error(new SudoVerificationError())
    }
    await this.sudoService.activateSudo(sid)
    return VoidResult.ok()
  }
  async sendVerifyEmail({
    userId,
    sid,
  }: Pick<SudoVerification<void>, "userId" | "sid">) {
    if (!sid) return Result.error(new SudoVerificationError())

    const user = await this.userRepository.getById(userId)
    if (!user.ok || !user.data) {
      return Result.error(new SudoVerificationError())
    }
    const expiresMs = ms("15m")
    await this.sudoActivateEvent.invoke({
      userId,
      payload: {
        sessionId: sid,
      },
      expiresMs,
      type: "code",
      mailOptions: {
        recipient: user.data.email,
        subject: "Verify your account email",
      },
      options: {
        code: {
          length: 8,
          pattern: NUMERIC_CODE_PATTERN,
        },
      },
    })
    const data: SudoEmailSent = {
      email: user.data.email,
      expiresAt: new Date(Date.now() + expiresMs),
    }
    return Result.success(data)
  }
}
export type IReauthService = Pick<ReauthService, keyof ReauthService>
