import { ISudoService } from "../../sudo/service/sudo.service"
import { EventContext, VerificationEvent } from "@features/verification"

export type SudoActivateData = {
  sessionId: string
}
export class SudoActivateEvent extends VerificationEvent<SudoActivateData> {
  readonly name: string = "sudo_activate"

  constructor(private readonly sudoService: ISudoService) {
    super({
      concurrency: 8,
    })
  }
  async resolve(context: EventContext<SudoActivateData>): Promise<boolean> {
    await this.sudoService.activateSudo(context.payload.sessionId)
    return true
  }
}
export type ISudoActivateEvent = Pick<SudoActivateEvent, "invoke" | "name">
