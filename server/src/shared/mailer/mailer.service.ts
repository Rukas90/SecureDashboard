import nodemailer from "nodemailer"
import { MailOptions } from "./mailer.type"
import type { Transporter } from "nodemailer"
import { VoidResult } from "@project/shared"
import { IEnvironment } from "@base/app"
import { FailedToSendMail } from "./mailer.error"

export class MailerService {
  private readonly transporter: Transporter
  private senderEmailAddress: string
  private isClosed: boolean = false

  constructor(environment: IEnvironment) {
    this.senderEmailAddress = environment.get.SENDER_EMAIL_ADDRESS

    this.transporter = nodemailer.createTransport({
      service: environment.get.SENDER_MAIL_SERVICE,
      auth: {
        user: this.senderEmailAddress,
        pass: environment.get.SENDER_EMAIL_PASSWORD,
      },
    })
  }
  async send(options: MailOptions) {
    if (this.isClosed) {
      return VoidResult.error(
        new FailedToSendMail(
          "Email could cannot be sent. Transporter is closed.",
        ),
      )
    }
    try {
      await this.transporter.sendMail({
        from: this.senderEmailAddress,
        to: options.recipient,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })
      return VoidResult.ok()
    } catch (error) {
      return VoidResult.error(
        new FailedToSendMail("Email was not sent successfully."),
      )
    }
  }
  close() {
    this.transporter.close()
    this.isClosed = true
  }
}
export type IMailerService = Pick<MailerService, "send">
