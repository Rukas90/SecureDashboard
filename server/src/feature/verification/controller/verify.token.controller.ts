import { createController } from "@base/shared/base"
import { IVerificationService } from "../service/verification.service"
import { AppConfig } from "@base/app"

export const createVerifyTokenController = (
  verificationService: IVerificationService,
  config: AppConfig,
) =>
  createController(async (req, res, next) => {
    const result = await verificationService.verifyVerification(
      req.query.token as string,
    )
    if (!result.ok) {
      return next(result.error)
    }
    res.redirect(config.origin.client)
  })
