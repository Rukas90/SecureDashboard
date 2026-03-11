import { CloudRedis } from "@base/redis"
import { JobsOptions, Queue, Worker, WorkerOptions } from "bullmq"
import { IEventManager } from "./event.manager"
import { VerificationEventJob } from "./event.job"

export type EventOptions = Pick<WorkerOptions, "concurrency">

interface IEventRunner {
  add<TPayload>(
    job: VerificationEventJob<TPayload>,
    options: JobsOptions,
  ): Promise<void>
}
export class EventRunner implements IEventRunner {
  private readonly name: string

  private queue: Queue
  private worker: Worker

  constructor(
    name: string,
    router: IEventManager,
    redis: CloudRedis,
    options?: EventOptions,
  ) {
    this.name = name

    this.queue = new Queue(name, {
      connection: redis.client,
    })
    this.worker = new Worker(name, async (job) => router.handler(job.data), {
      connection: redis.client,
      ...options,
    })
  }
  async add<TPayload>(
    job: VerificationEventJob<TPayload>,
    options: JobsOptions,
  ) {
    await this.queue.add(this.name, job, options)
  }
  async dispose(): Promise<void> {
    await this.worker.close()
    await this.queue.close()
  }
}
