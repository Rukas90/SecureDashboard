import { Queue } from "bullmq"
import { eventsRedis } from "@base/redis"
import { VerificationJob } from "./verification.type"
import { Dispatch } from "@shared/dispatch"

export const VERIFICATION_QUEUE = "establishVerification"

const verificationQueue = new Queue(VERIFICATION_QUEUE, {
  connection: eventsRedis,
})

export const establishVerification = async <TDispatch extends Dispatch>(
  job: VerificationJob<TDispatch>,
) => {
  await verificationQueue.add(VERIFICATION_QUEUE, job, {
    jobId: `verify:${job.data.userId}:${job.data.dispatchName}`,
    attempts: 1,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: true,
  })
}
