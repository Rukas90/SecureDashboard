export default class Environment {
  get: ((key: string) => string) & Record<string, string>

  constructor() {
    this.get = new Proxy(
      (key: string): string => {
        const value = process.env[key]
        if (!value)
          throw new Error(`Environment variable "${key}" is not defined.`)
        return value
      },
      {
        get(_, key: string) {
          const value = process.env[key]
          if (!value)
            throw new Error(`Environment variable "${key}" is not defined.`)
          return value
        },
      },
    ) as ((key: string) => string) & Record<string, string>
  }

  getOr(key: string, fallback: string): string
  getOr(key: string, fallback: number): number
  getOr(key: string, fallback: boolean): boolean
  getOr<T extends string | number | boolean>(key: string, fallback: T): T {
    const value = process.env[key]

    if (!value) {
      return fallback
    }
    if (typeof fallback === "number") {
      return Number(value) as T
    }
    if (typeof fallback === "boolean") {
      return (value === "true") as T
    }
    return value as T
  }
  getOptional(key: string): string | undefined {
    return process.env[key]
  }
  getArray(key: string): string[] {
    return process.env[key]?.split(",") ?? []
  }
}

export type IEnvironment = Pick<
  Environment,
  "get" | "getArray" | "getOptional" | "getOr"
>
