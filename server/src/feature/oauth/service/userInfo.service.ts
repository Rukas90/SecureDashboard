import { OAuthProvider, Result } from "@project/shared"
import {
  OAuthEmailNotProvidedError,
  OAuthUserInfoFetchFailedError,
} from "../error/oauth.error"
import { OAuthUserInfo } from "../types/oauth.types"
import { IOAuthConfigService } from "./config.service"

export type GithubEmail = {
  email: string
  verified: boolean
  primary: boolean
  visibility: string
}

interface GoogleUserInfoRes {
  id: string | number
  email: string
  name: string
  verified_email?: boolean
}
interface GithubUserInfoRes {
  id: string | number
  name: string
  login: string
}

export class UserInfoService {
  constructor(private readonly oauthConfig: IOAuthConfigService) {}

  async fetchUserInfo(provider: OAuthProvider, accessToken: string) {
    switch (provider) {
      case "google":
        return this.getGoogleUserInfo(accessToken)
      case "github":
        return this.getGithubUserInfo(accessToken)
    }
  }
  private async getGoogleUserInfo(accessToken: string) {
    const config = this.oauthConfig.google
    const response = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    if (!response.ok) {
      return Result.error(new OAuthUserInfoFetchFailedError("google"))
    }
    const data = (await response.json()) as GoogleUserInfoRes
    const info: OAuthUserInfo = {
      providerId: data.id.toString(),
      email: data.email,
      name: data.name,
      emailVerified: data.verified_email ?? false,
      username: data.email,
    }
    return Result.success(info)
  }
  private async getGithubUserInfo(accessToken: string) {
    const config = this.oauthConfig.github
    const response = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    })
    if (!response.ok) {
      return Result.error(new OAuthUserInfoFetchFailedError("github"))
    }
    const address = await this.getGithubAccountAddress(accessToken)

    if (!address.ok) {
      return Result.error(address.error)
    }
    const data = (await response.json()) as GithubUserInfoRes
    const info: OAuthUserInfo = {
      providerId: data.id.toString(),
      email: address.data.email,
      name: data.name,
      emailVerified: address.data.verified,
      username: data.login,
    }
    return Result.success(info)
  }
  private async getGithubAccountAddress(accessToken: string) {
    try {
      const config = this.oauthConfig.github
      const emails: GithubEmail[] = (await fetch(config.emailsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then((r) => r.json())) as GithubEmail[]

      let address =
        emails.find((e) => e.primary && e.verified) ??
        emails.find((e) => e.verified) ??
        emails.find((e) => e.primary)

      if (!address) {
        return Result.error(new OAuthEmailNotProvidedError())
      }
      return Result.success(address)
    } catch {
      return Result.error(new OAuthEmailNotProvidedError())
    }
  }
}
export type IUserInfoService = Pick<UserInfoService, keyof UserInfoService>
