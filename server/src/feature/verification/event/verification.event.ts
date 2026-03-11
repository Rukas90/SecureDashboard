import {
  VerificationMailOptions,
  VerificationOptions,
  VerificationType,
} from "../service/verification.service"
import { JobsOptions } from "bullmq"
import { EventManager } from "./event.manager"
import { EventOptions } from "./event.runner"
import { EventContext } from "./event.context"

export type VerificationEventData<TPayload> = {
  userId: string
  payload: TPayload
  expiresMs?: number
  type: VerificationType
  mailOptions: VerificationMailOptions
  options?: VerificationOptions
}
export type VerificationEventJob<TPayload> = {
  event: string
  data: VerificationEventData<TPayload>
}

export abstract class VerificationEvent<TPayload> {
  abstract readonly name: string

  private static manager: EventManager

  constructor(private readonly eventOptions?: EventOptions) {
    if (!VerificationEvent.manager) {
      throw new Error(
        "VerificationEvent.initialize(...) has to be called during app initialization.",
      )
    }
    queueMicrotask(() => VerificationEvent.manager.register(this)) // TODO: ?
  }

  static initialize(manager: EventManager) {
    VerificationEvent.manager = manager
  }
  async invoke(data: VerificationEventData<TPayload>): Promise<void> {
    const runner = VerificationEvent.manager.getRunner(this, this.eventOptions)
    const job: VerificationEventJob<TPayload> = {
      event: this.name,
      data,
    }
    runner.add(job, this.getJobOptions(data.userId))
  }
  abstract resolve(context: EventContext<TPayload>): Promise<boolean>

  private getJobOptions(userId: string): JobsOptions {
    return {
      jobId: `verify:${this.name}:${userId}`,
      attempts: 1,
      backoff: {
        type: "exponential",
        delay: 3000,
      },
      removeOnComplete: true,
      removeOnFail: true,
    }
  }
}
