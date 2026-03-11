import { type Express } from "express"

export interface BaseRoute<TDependencies> {
  app: Express
  deps: TDependencies
}
