export type ProblemDetails = {
  type: string
  title: string
  status: number
  detail: string
  code: string
  instance: string
  stack?: string
  extensions?: Record<string, unknown>
}
