import {
  VerificationType,
  VerificationMailOptions,
  VerificationOptions,
} from "../service/verification.service"

export type VerificationEventData<TPayload> = {
  userId: string
  payload: TPayload
  expiresMs?: number
  type: VerificationType
  mailOptions: VerificationMailOptions
  options?: VerificationOptions
}
export type VerificationEventJob<TPayload> = {
  event: string
  data: VerificationEventData<TPayload>
}
