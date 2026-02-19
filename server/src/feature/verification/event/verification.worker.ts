import { eventsRedis } from "@base/redis"
import { VERIFICATION_QUEUE } from "./verification.queue"
import { Job, Worker } from "bullmq"
import { VerificationJob } from "./verification.type"
import verificationService from "../service/verification.service"
import { Result } from "@project/shared"
import { Verification } from "@prisma/client"
import { Dispatch } from "@shared/dispatch"
import logger from "@shared/logger"

const processJob = async <TDispatch extends Dispatch>(job: Job) => {
  try {
    const { data, type }: VerificationJob<TDispatch> = job.data
    let func: Promise<Result<Verification, Error>>

    switch (type) {
      case "code":
        func = verificationService.establishCodeVerification(data)
        break
      case "token":
        func = verificationService.establishTokenVerification(data)
        break
      default:
        throw new Error(`Unknown verification type: ${type satisfies never}`)
    }
    const result = await func

    if (!result.ok) {
      logger.error(`Verification job ${job.id} failed:`, result.error)
      throw result.error
    }
    return result.data
  } catch (error) {
    logger.error("Error in processJob:", error)
    throw error
  }
}

const createWorker = () => {
  return new Worker(VERIFICATION_QUEUE, processJob, {
    connection: eventsRedis,
    concurrency: 5,
  })
}
export default createWorker
