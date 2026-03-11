export const isExpired = (expiresAt: Date | string) =>
  new Date() > new Date(expiresAt)
