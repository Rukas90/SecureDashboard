import { Result } from "@project/shared"
import { DatabaseError, UniqueConstraintError } from "../errors"
import { Prisma, PrismaClient } from "@prisma/client"

export type TransactionClient = Prisma.TransactionClient
export type QueryClient = PrismaClient | TransactionClient

export abstract class BaseRepository {
  constructor(private readonly client: PrismaClient) {}

  protected async query<T>(
    fn: (client: QueryClient) => Promise<T>,
    tx?: TransactionClient,
    operation?: string,
  ): Promise<Result<T, DatabaseError>> {
    try {
      return Result.success(await fn(tx ?? this.client))
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const field = (error.meta?.target as string[])?.[0] ?? "field"
        return Result.error(new UniqueConstraintError(field))
      }
      return Result.error(new DatabaseError(operation))
    }
  }
}
