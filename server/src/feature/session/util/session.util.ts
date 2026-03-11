import { Device, SessionLocation, UserAgent } from "@project/shared"
import { UAParser } from "ua-parser-js"

export const parseUserAgent = (userAgentString: string): UserAgent => {
  const parser = new UAParser(userAgentString)
  const result = parser.getResult()

  return {
    browser: result.browser.name || "Unknown Browser",
    browserVersion: result.browser.version,
    os: result.os.name || "Unknown OS",
    osVersion: result.os.version,
    device: result.device.type
      ? ((result.device.type.charAt(0).toUpperCase() +
          result.device.type.slice(1)) as Device)
      : "Desktop",
  }
}
export const parseLocation = (
  locationString: string | null,
  ipAddress: string,
): SessionLocation | "localhost" | null => {
  if (isLocalhost(ipAddress)) {
    return "localhost"
  }
  if (!locationString) {
    return null
  }
  try {
    const parts = locationString.split(",").map((p) => p.trim())

    if (parts.length >= 2) {
      return {
        city: parts[0],
        region: parts.length > 2 ? parts[1] : undefined,
        country: parts[parts.length - 1],
      }
    }
    return null
  } catch {
    return null
  }
}
export const isLocalhost = (ipAddress: string) => {
  return (
    ipAddress === "127.0.0.1" ||
    ipAddress === "::1" ||
    ipAddress.startsWith("localhost")
  )
}
