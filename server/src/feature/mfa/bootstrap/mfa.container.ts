import { CoreContainer, DatabaseContainer } from "@base/bootstrap"
import { EnrollmentRepository } from "../repository/enrollments.repository"
import { RecoveryRepository } from "../repository/recovery.repository"
import { MfaService } from "../service/mfa.service"
import { RecoveryService } from "../service/recovery.service"
import { TotpService } from "../service/totp.service"
import { UserContainer } from "@base/feature/user"

export default class MfaContainer {
  readonly enrollmentsRepository: EnrollmentRepository
  readonly recoveryRepository: RecoveryRepository

  readonly mfaService: MfaService
  readonly recoveryService: RecoveryService
  readonly totpService: TotpService

  constructor(
    core: CoreContainer,
    database: DatabaseContainer,
    user: UserContainer,
  ) {
    // Create repositories
    this.enrollmentsRepository = new EnrollmentRepository(database.client)
    this.recoveryRepository = new RecoveryRepository(database.client)

    // Create services
    this.recoveryService = new RecoveryService(
      this.recoveryRepository,
      database.unitOfWork,
      core.environment,
    )
    this.mfaService = new MfaService(
      this.recoveryService,
      this.recoveryRepository,
      this.enrollmentsRepository,
      database.unitOfWork,
    )
    this.totpService = new TotpService(
      user.userRepository,
      this.mfaService,
      this.enrollmentsRepository,
      database.unitOfWork,
      core.config,
      core.logger,
      core.environment,
    )
  }
}
