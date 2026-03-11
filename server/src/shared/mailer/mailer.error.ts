import { UnexpectedError } from "../errors"

export class FailedToSendMail extends UnexpectedError {
  constructor(message?: string) {
    super(message ?? "Failed to send mail.", "MAILER_FAILED_TO_MAIL")
  }
}
