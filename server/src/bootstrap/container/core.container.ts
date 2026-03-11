import { Environment, AppConfig } from "@base/app"
import { Logger } from "@shared/logger"

export class CoreContainer {
  readonly logger: Logger
  readonly environment: Environment
  readonly config: AppConfig

  constructor() {
    this.environment = new Environment()
    this.logger = new Logger(this.environment)
    this.config = new AppConfig(this.environment)
  }
}
