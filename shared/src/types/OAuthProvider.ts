export const OAuthProviderCollection = ["google", "github"] as const
export type OAuthProvider = (typeof OAuthProviderCollection)[number]
