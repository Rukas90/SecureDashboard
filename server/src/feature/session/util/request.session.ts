import { Request } from "express"
import { SessionContext } from "../types/session.types"

export const extractSessionContext = (req: Request): SessionContext => {
  return {
    userAgent: req.headers["user-agent"] || "Unknown",
    ipAddress: req.ip || req.socket.remoteAddress || "Unknown",
    location: undefined, // TODO: Get location from Ip
  }
}
