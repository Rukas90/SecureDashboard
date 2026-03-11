import { Prisma } from "@prisma/client"
import { BaseRepository, TransactionClient } from "@base/shared/base"

export type UserResult<T extends Prisma.UserInclude | undefined> =
  Prisma.UserGetPayload<{ include: T }> | null

type CreateUserInput = {
  email: string
  isVerified: boolean
  passwordHash?: string
}

export class UserRepository extends BaseRepository {
  async getByEmail<T extends Prisma.UserInclude | undefined>(
    email: string,
    include?: T,
    tx?: TransactionClient,
  ) {
    return this.query<UserResult<T>>(
      (client) =>
        client.user.findUnique({
          where: { email },
          include,
        }) as Promise<UserResult<T>>,
      tx,
      "Failed to find user by email",
    )
  }
  async getById<T extends Prisma.UserInclude | undefined>(
    userId: string,
    include?: T,
    tx?: TransactionClient,
  ) {
    return this.query<UserResult<T>>(
      (client) =>
        client.user.findUnique({
          where: { id: userId },
          include,
        }) as Promise<UserResult<T>>,
      tx,
      "Failed to find user by id.",
    )
  }
  async create(input: CreateUserInput, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.user.create({
          data: {
            email: input.email,
            is_verified: input.isVerified,
            password_hash: input.passwordHash,
          },
        }),
      tx,
      "Failed to create new user.",
    )
  }
  async verifyById(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.user.update({
          where: {
            id: userId,
          },
          data: {
            is_verified: true,
          },
        }),
      tx,
      "Failed to verify user.",
    )
  }
  async updatePasswordById(
    userId: string,
    passwordHash: string,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.user.update({
          where: {
            id: userId,
          },
          data: {
            password_hash: passwordHash,
          },
        }),
      tx,
      "Failed to update user password.",
    )
  }
  async deleteById(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.user.delete({
          where: {
            id: userId,
          },
        }),
      tx,
      "Failed to delete user by id.",
    )
  }
}

export type IUserRepository = Pick<
  UserRepository,
  | "getById"
  | "getByEmail"
  | "create"
  | "verifyById"
  | "updatePasswordById"
  | "deleteById"
>
