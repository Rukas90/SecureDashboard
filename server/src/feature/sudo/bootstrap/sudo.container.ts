import { DatabaseContainer } from "@base/bootstrap"
import { SudoService } from "../service/sudo.service"
import { RequestHandler } from "express"
import createRequireSudo from "../middleware/require.sudo"

export default class SudoContainer {
  readonly sudoService: SudoService
  readonly requiresSudo: RequestHandler

  constructor(database: DatabaseContainer) {
    this.sudoService = new SudoService(database.appRedis)
    this.requiresSudo = createRequireSudo(this.sudoService)
  }
}
