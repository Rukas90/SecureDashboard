import { MfaMethod } from "@project/shared"
import { BaseRepository, TransactionClient } from "@shared/base"

export class EnrollmentRepository extends BaseRepository {
  async findAllByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.mfaEnrollment.findMany({
          where: {
            user_id: userId,
          },
        }),
      tx,
      "Failed to find enrollments by user id.",
    )
  }
  async findAllConfiguredByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.mfaEnrollment.findMany({
          where: {
            user_id: userId,
            configured: true,
          },
        }),
      tx,
      "Failed to find configured enrollments by user id.",
    )
  }
  async countConfiguredByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.mfaEnrollment.count({
          where: {
            user_id: userId,
            configured: true,
          },
        }),
      tx,
      "Failed to get configured enrollments count by user id.",
    )
  }
  async findAllByUserIdAndMethod(
    userId: string,
    method: MfaMethod,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.mfaEnrollment.findUnique({
          where: {
            user_id_method: {
              user_id: userId,
              method: method,
            },
          },
        }),
      tx,
      "Failed to find method enrollments by user id.",
    )
  }
  async markMethodAsConfiguredByUserId(
    userId: string,
    method: MfaMethod,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.mfaEnrollment.updateMany({
          where: {
            user_id: userId,
            method: method,
          },
          data: {
            configured: true,
            expires_At: undefined,
          },
        }),
      tx,
      "Failed to configure enrollment method by user id.",
    )
  }
  async create(
    userId: string,
    method: MfaMethod,
    expMin: number,
    tx?: TransactionClient,
  ) {
    const expiration = new Date(Date.now() + expMin * 60 * 1000)
    return this.query(
      (client) =>
        client.mfaEnrollment.upsert({
          where: {
            user_id_method: {
              user_id: userId,
              method: method,
            },
          },
          update: {
            configured: false,
            expires_At: expiration,
            credentials: undefined,
          },
          create: {
            user_id: userId,
            method: method,
            configured: false,
            expires_At: expiration,
          },
        }),
      tx,
      "Failed to create new enrollment method.",
    )
  }
  async deleteByUserIdAndMethod(
    userId: string,
    method: MfaMethod,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.mfaEnrollment.deleteMany({
          where: {
            user_id: userId,
            method: method,
          },
        }),
      tx,
      "Failed to delete the enrollment method.",
    )
  }
  async deleteById(enrollmentId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.mfaEnrollment.deleteMany({
          where: {
            id: enrollmentId,
          },
        }),
      tx,
      "Failed to delete the enrollment by enrollment id.",
    )
  }
  async countByUserId(userId: string, tx?: TransactionClient) {
    return this.query(
      (client) =>
        client.mfaEnrollment.count({
          where: {
            user_id: userId,
          },
        }),
      tx,
      "Failed to get the enrollments count by user id.",
    )
  }
  async updateCredentials(
    enrollmentId: string,
    credentials: string,
    tx?: TransactionClient,
  ) {
    return this.query(
      (client) =>
        client.mfaEnrollment.update({
          where: {
            id: enrollmentId,
          },
          data: {
            credentials,
          },
        }),
      tx,
      "Failed to update the enrollment credentials.",
    )
  }
}
export type IEnrollmentRepository = Pick<
  EnrollmentRepository,
  keyof EnrollmentRepository
>
