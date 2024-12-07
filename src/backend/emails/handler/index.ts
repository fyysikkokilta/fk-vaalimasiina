import Email from 'email-templates'
import path from 'path'
import { fileURLToPath } from 'url'

import { Election } from '../../../../types/types'
import mailTransporter from './config'

export interface VotingMailParams {
  election: Omit<Election, 'candidates' | 'status'>
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CSS_DIR = path.join(__dirname, '..', 'css')

const votingMailPath = path.join(__dirname, '..', 'mail', 'email.pug')

const TEMPLATE_OPTIONS = {
  juice: true,
  juiceResources: {
    preserveImportant: true,
    webResources: {
      relativeTo: CSS_DIR
    }
  }
}

export default class EmailService {
  static send(
    to: { email: string; voterId: string }[],
    subject: string,
    html: string
  ) {
    const msg = {
      to: to.map((voter) => voter.email),
      from: process.env.MAIL_FROM,
      subject,
      html,
      'recipient-variables': JSON.stringify(
        to.reduce(
          (acc, voter) => {
            acc[voter.email] = { voterId: voter.voterId }
            return acc
          },
          {} as Record<string, { voterId: string }>
        )
      )
    }

    return mailTransporter.sendMail(msg)
  }

  static async sendVotingMail(
    to: { email: string; voterId: string }[],
    params: VotingMailParams
  ) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sending voting mail to:', to)
      console.log('Params:', params)
      return
    }
    try {
      const email = new Email(TEMPLATE_OPTIONS)
      const brandedParams = {
        ...params,
        branding: {
          footerText: process.env.BRANDING_MAIL_FOOTER_TEXT,
          footerLink: process.env.BRANDING_MAIL_FOOTER_LINK
        },
        votingLink: `${process.env.BASE_URL}/vote/%recipient.voterId%` // %recipient.voterId% is populated by Mailgun
      }
      const template = votingMailPath
      const html = await email.render(template, brandedParams)
      const subject = `${process.env.BRANDING_EMAIL_SUBJECT_PREFIX} - ${params.election.title}`
      await EmailService.send(to, subject, html)
    } catch (error) {
      console.error(error)
    }
  }
}
