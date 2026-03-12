import { MfaEnrollment } from "@prisma/client"
import { IEnrollmentRepository } from "../repository/enrollments.repository"
import {
  MfaEnrollmentInfo,
  MfaMethod,
  Result,
  VoidResult,
} from "@project/shared"
import {
  CreateRecoveryCodeInput,
  IRecoveryRepository,
} from "../repository/recovery.repository"
import { MfaNotFoundError } from "../error/mfa.error"
import { IUnitOfWork } from "@shared/base"
import { IRecoveryService } from "./recovery.service"
import { DatabaseError } from "@shared/errors"

type EnrollmentStatus =
  | "NULL"
  | "EXPIRED"
  | "INVALID"
  | "AWAITING_VERIFICATION"
  | "CONFIGURED"

export class MfaService {
  constructor(
    private readonly recoveryService: IRecoveryService,
    private readonly recoveryRepository: IRecoveryRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async configureEnrollment(userId: string, method: MfaMethod) {
    const hasBackupCodes = await this.recoveryRepository.existsByUserId(userId)
    if (!hasBackupCodes.ok) return hasBackupCodes

    const newCodes = hasBackupCodes.data
      ? null
      : await this.prepareRecoveryCodes()

    return this.unitOfWork.run(async (tx) => {
      await Result.orThrowAsync(
        this.enrollmentRepository.markMethodAsConfiguredByUserId(
          userId,
          method,
          tx,
        ),
      )
      if (!newCodes) {
        // As user already has recovery backup codes, no new codes were created, so nothing to return.
        return Result.success(null)
      }
      await Result.orThrowAsync(
        this.recoveryRepository.createMany(userId, newCodes.inputs, tx),
      )
      return Result.success(newCodes.codes)
    }, "EnrollmentConfigure")
  }
  private async prepareRecoveryCodes() {
    const codes = this.recoveryService.generateBackupCodes()
    const inputs = await this.recoveryService.mapToCreateCodeInputs(codes)

    return { codes, inputs }
  }
  async revokeEnrollment(
    userId: string,
    method: MfaMethod,
  ): Promise<VoidResult<MfaNotFoundError | DatabaseError>> {
    return this.unitOfWork.run(async (tx) => {
      const deletion = await Result.orThrowAsync(
        this.enrollmentRepository.deleteByUserIdAndMethod(userId, method, tx),
      )
      if (deletion.count <= 0) {
        throw new MfaNotFoundError()
      }
      const remaining = await Result.orThrowAsync(
        this.enrollmentRepository.countByUserId(userId, tx),
      )

      if (remaining === 0) {
        await Result.orThrowAsync(
          this.recoveryRepository.deleteAllByUserId(userId, tx),
        )
      }
      return VoidResult.ok()
    }, "EnrollmentRevoke")
  }
  async getUserEnrollments(userId: string) {
    const enrollments = await this.enrollmentRepository.findAllByUserId(userId)
    if (!enrollments.ok) return enrollments

    const infos: MfaEnrollmentInfo[] = enrollments.data.map((e) => ({
      method: e.method as MfaMethod,
      configured: e.configured,
    }))
    return Result.success(infos)
  }
  getEnrollmentStatus(enrollment: MfaEnrollment | null): EnrollmentStatus {
    if (!enrollment) {
      return "NULL"
    }
    if (enrollment.configured) {
      return "CONFIGURED"
    }
    if (!enrollment.expires_At) {
      return "INVALID"
    }
    if (new Date() > enrollment.expires_At) {
      return "EXPIRED"
    }
    return "AWAITING_VERIFICATION"
  }
}
export type IMfaService = Pick<MfaService, keyof MfaService>
