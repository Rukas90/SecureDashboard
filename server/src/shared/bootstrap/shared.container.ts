import { CoreContainer, DatabaseContainer } from "@base/bootstrap"
import { JwtService, RefreshService, RefreshRepository } from "../token"
import { createInitializeCsrf, createValidateCsrf, CsrfService } from "../csrf"
import { CaptchaService, createValidateCaptchaToken } from "../captcha"
import { RequestHandler } from "express"
import { MailerService } from "../mailer"
import { createRateLimiter } from "../middleware"

export default class SharedContainer {
  readonly jwtService: JwtService
  readonly refreshService: RefreshService
  readonly csrfService: CsrfService
  readonly captchaService: CaptchaService
  readonly mailerService: MailerService

  readonly refreshRepository: RefreshRepository

  readonly csrfInitialize: RequestHandler
  readonly csrfValidate: RequestHandler
  readonly captchaValidateToken: RequestHandler

  readonly rateLimits: {
    strict: RequestHandler
    standard: RequestHandler
    relaxed: RequestHandler
    default: RequestHandler
  }

  constructor(core: CoreContainer, database: DatabaseContainer) {
    const { config, environment, logger } = core

    this.refreshRepository = new RefreshRepository(database.client)

    this.jwtService = new JwtService(config, environment)
    this.refreshService = new RefreshService(
      this.refreshRepository,
      environment,
    )
    this.csrfService = new CsrfService(config, environment)
    this.captchaService = new CaptchaService(environment, logger)
    this.mailerService = new MailerService(environment)

    this.csrfInitialize = createInitializeCsrf(this.csrfService)
    this.csrfValidate = createValidateCsrf(this.csrfService)
    this.captchaValidateToken = createValidateCaptchaToken(this.captchaService)
    this.rateLimits = {
      default: createRateLimiter("default"),
      standard: createRateLimiter("standard"),
      relaxed: createRateLimiter("relaxed"),
      strict: createRateLimiter("strict"),
    }
  }
}
