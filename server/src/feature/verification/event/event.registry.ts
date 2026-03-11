import { ILogger } from "@shared/logger"
import { VerificationEvent } from "./verification.event"
import chalk from "chalk"

export class EventRegistry {
  private readonly registry = new Map<string, VerificationEvent<unknown>>()

  constructor(private readonly logger: ILogger) {}

  register(event: VerificationEvent<unknown>) {
    this.registry.set(event.name, event)
    this.logger.success(chalk.cyanBright("Registered event"), event.name)
  }
  get(name: string) {
    return this.registry.get(name)
  }
}
export type IEventRegistry = Pick<EventRegistry, "get">
