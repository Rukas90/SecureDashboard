import { PrismaClient } from "@prisma/client"
import { TransactionClient } from "./base.repository"
import { DomainError, UnexpectFailedOperation } from "../errors"
import { Result } from "@project/shared"
import { wrap } from "./wrap"

export interface IUnitOfWork {
  run<T, E extends DomainError>(
    fn: (tx: TransactionClient) => Promise<Result<T, E>>,
    operation?: string,
  ): Promise<Result<T, E | UnexpectFailedOperation>>
}
export class UnitOfWork implements IUnitOfWork {
  constructor(private readonly client: PrismaClient) {}

  async run<T, E extends DomainError>(
    fn: (tx: TransactionClient) => Promise<Result<T, E>>,
    operation?: string,
  ): Promise<Result<T, E | UnexpectFailedOperation>> {
    return wrap(async () => this.client.$transaction(fn), operation)
  }
}
