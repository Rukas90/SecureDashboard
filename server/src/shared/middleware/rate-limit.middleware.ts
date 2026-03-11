import { Options, rateLimit } from "express-rate-limit"

const BASE_OPTIONS: Partial<Options> = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
  statusCode: 429,
}
type LimitMode = "strict" | "standard" | "relaxed" | "default"

const CONFIG_OPTIONS: Record<LimitMode, Partial<Options>> = {
  strict: { windowMs: 15 * 60 * 1000, max: 10 },
  standard: { windowMs: 60 * 60 * 1000, max: 20 },
  relaxed: { windowMs: 60 * 1000, max: 120 },
  default: { windowMs: 15 * 60 * 1000, max: 200 },
}

export const createRateLimiter = (
  mode: LimitMode = "default",
  overrides?: Partial<Options>,
) =>
  rateLimit({
    ...BASE_OPTIONS,
    ...CONFIG_OPTIONS[mode],
    ...overrides,
  } as Options)
