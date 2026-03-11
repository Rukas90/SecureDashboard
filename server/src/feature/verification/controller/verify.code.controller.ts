import { createController } from "@base/shared/base"
import { IVerificationService } from "../service/verification.service"

export const createVerifyCodeController = (
  verificationService: IVerificationService,
) =>
  createController(async (req, res, next) => {
    const result = await verificationService.verifyVerification(req.body.code)
    if (!result.ok) {
      return next(result.error)
    }
    res.ok("Verified successfully!")
  })
