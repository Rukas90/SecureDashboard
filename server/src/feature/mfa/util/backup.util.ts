import { env } from "@base/app"
import { hashing } from "@shared/security"

export const generateLookupHash = async (code: string): Promise<string> => {
  return await hashing.hmac.hash(code, env.get.BACKUP_CODE_LOOKUP_SECRET)
}
