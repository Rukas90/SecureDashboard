import { EventContext, VerificationEvent } from "@features/verification"
import { IUserRepository } from "../repository/user.repository"

export class VerifyUserEvent extends VerificationEvent<void> {
  readonly name: string = "verify_user"

  constructor(private readonly userRepository: IUserRepository) {
    super({
      concurrency: 5,
    })
  }
  async resolve(context: EventContext<void>): Promise<boolean> {
    await this.userRepository.verifyById(context.userId)
    return true
  }
}
export type IVerifyUserEvent = Pick<VerifyUserEvent, "invoke" | "name">
