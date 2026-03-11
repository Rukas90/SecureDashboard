export type EventContext<TPayload> = {
  userId: string
  payload: TPayload
  verificationId: string
  createdAt: Date
}
