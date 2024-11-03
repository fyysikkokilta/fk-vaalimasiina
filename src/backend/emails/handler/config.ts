import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import mailgun from "nodemailer-mailgun-transport";

const mailTransporter: Transporter = (() => {
  if (process.env.MAILGUN_API_KEY) {
    if (!process.env.MAILGUN_DOMAIN) {
      throw new Error("Invalid email config: MAILGUN_DOMAIN must be set with MAILGUN_API_KEY.");
    }
    return nodemailer.createTransport(
      mailgun({
        auth: {
          api_key: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
        },
        host: process.env.MAILGUN_HOST,
      }),
    );
  }

  if (process.env.SMTP_HOST) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error("Invalid email config: SMTP_USER and SMTP_PASSWORD must be set with SMTP_HOST.");
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ?? undefined,
      secure: process.env.SMTP_TLS,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    } as SMTPTransport.Options);
  }

  console.warn("Neither Mailgun nor SMTP is configured. Falling back to debug mail service.");
  return nodemailer.createTransport({
    name: "debug mail service",
    version: "0",
    send(mail, callback) {
      const { message } = mail;
      const envelope = message.getEnvelope();
      const messageId = message.messageId();
      const input = message.createReadStream();
      let data = "";
      input.on("data", (chunk) => {
        data += chunk;
      });
      input.on("end", () => {
        console.log(data);
        callback(null, { envelope, messageId } as SMTPTransport.SentMessageInfo);
      });
    },
  });
})();

export default mailTransporter;