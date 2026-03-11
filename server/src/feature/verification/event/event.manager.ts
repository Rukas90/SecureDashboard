import { EventOptions, EventRunner } from "./event.runner"
import { CloudRedis } from "@base/redis"
import { IVerificationService } from "../service/verification.service"
import { VerificationEvent, VerificationEventJob } from "./verification.event"
import { EventRegistry } from "./event.registry"

export interface IEventManager {
  handler<TPayload>(job: VerificationEventJob<TPayload>): Promise<void>
}
export class EventManager implements IEventManager {
  private readonly runners: Map<string, EventRunner> = new Map<
    string,
    EventRunner
  >()
  constructor(
    private readonly registry: EventRegistry,
    private readonly verificationService: IVerificationService,
    private readonly redis: CloudRedis,
  ) {}
  register(event: VerificationEvent<unknown>) {
    this.registry.register(event)
  }
  getRunner<TPayload>(
    event: VerificationEvent<TPayload>,
    options?: EventOptions,
  ) {
    let runner = this.runners.get(event.name)

    if (!runner) {
      runner = new EventRunner(event.name, this, this.redis, options)
      this.runners.set(event.name, runner)
    }
    return runner
  }
  async handler<TPayload>(job: VerificationEventJob<TPayload>) {
    await this.verificationService.establishVerificationJob(job)
  }
  async dispose(): Promise<void> {
    await Promise.all([...this.runners.values()].map((r) => r.dispose()))
  }
}
