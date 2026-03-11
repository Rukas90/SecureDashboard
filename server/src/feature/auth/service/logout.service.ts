import { wrap } from "@base/shared/base"
import { ISessionRevokeService } from "@features/session"
import { Result, VoidResult } from "@project/shared"
import { IRefreshService } from "@shared/token"

export class LogoutService {
  constructor(
    private readonly refreshService: IRefreshService,
    private readonly sessionRevokeService: ISessionRevokeService,
  ) {}

  async logout(currentRefreshToken?: string) {
    return wrap(async () => {
      if (currentRefreshToken) {
        const token = await Result.orThrowAsync(
          this.refreshService.findRefreshToken(currentRefreshToken),
        )
        await Result.orThrowAsync(
          this.sessionRevokeService.revokeFamily(token.family_id),
        )
      }
      return VoidResult.ok()
    })
  }
}
export type ILogoutService = Pick<LogoutService, keyof LogoutService>
