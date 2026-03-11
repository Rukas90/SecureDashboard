import { AppConfig, IEnvironment } from "@base/app"
import { CSRF_COOKIE_NAME } from "@project/shared"
import crypto from "crypto"
import { Response, CookieOptions } from "express"

export class CsrfService {
  private readonly secret: string
  private readonly cookieOptions: CookieOptions

  constructor(config: AppConfig, environment: IEnvironment) {
    this.secret = environment.get.CSRF_SECRET
    this.cookieOptions = {
      httpOnly: false,
      secure: config.isProduction,
      sameSite: "lax",
      path: "/",
      domain: config.domain,
    }
  }
  generateToken() {
    const token = crypto.randomBytes(32).toString("hex")
    const signature = crypto
      .createHmac("sha256", this.secret)
      .update(token)
      .digest("hex")
    return `${token}.${signature}`
  }
  verifyToken(token: string) {
    const [value, signature] = token.split(".")

    if (!value || !signature) {
      return false
    }
    const expectedSignature = crypto
      .createHmac("sha256", this.secret)
      .update(value)
      .digest("hex")

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  }
  setCookie(res: Response): string {
    const token = this.generateToken()
    res.cookie(CSRF_COOKIE_NAME, token, this.cookieOptions)
    return token
  }
}
export type ICsrfService = Pick<CsrfService, keyof CsrfService>
