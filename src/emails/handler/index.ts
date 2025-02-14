import { TRPCError } from '@trpc/server'
import FormData from 'form-data'
import Mailgun from 'mailgun.js'
import path from 'path'
import { compileFile } from 'pug'
import { fileURLToPath } from 'url'

export interface VotingMailParams {
  election: {
    title: string
    description: string
    seats: number
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CSS_DIR = path.join(__dirname, '..', 'css')

const votingMailPath = path.join(__dirname, '..', 'mail', 'email.pug')

const getMailgunClient = () => {
  const mailgun = new Mailgun(FormData)
  if (!process.env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not set')
  }
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY,
    url: process.env.MAILGUN_HOST || 'https://api.eu.mailgun.net'
  })
}

export const sendVotingMail = async (
  to: { email: string; voterId: string }[],
  params: VotingMailParams
) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Sending voting mail to:', to)
    console.log('Params:', params)
    return
  }
  try {
    const brandedParams = {
      ...params,
      branding: {
        footerText: process.env.BRANDING_MAIL_FOOTER_TEXT,
        footerLink: process.env.BRANDING_MAIL_FOOTER_LINK
      },
      // %recipient.voterId% is populated by Mailgun
      votingLinkFi: `${process.env.BASE_URL}/fi/vote/%recipient.voterId%`,
      votingLinkEn: `${process.env.BASE_URL}/en/vote/%recipient.voterId%`
    }

    const template = votingMailPath
    const html = compileFile(template, {
      basedir: CSS_DIR,
      pretty: true
    })(brandedParams)
    const subjectPrefix =
      process.env.BRANDING_EMAIL_SUBJECT_PREFIX || 'Vaalimasiina'
    const subject = `${subjectPrefix} - ${params.election.title}`

    const emailParams = {
      to: to.map((voter) => voter.email),
      from: process.env.MAIL_FROM || 'Vaalimasiina <vaalit@kilta.fi>',
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

    const client = getMailgunClient()

    if (!process.env.MAILGUN_DOMAIN) {
      throw new Error('MAILGUN_DOMAIN is not set')
    }

    await client.messages.create(process.env.MAILGUN_DOMAIN, emailParams)
  } catch (error) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'mail_sending_failed',
      cause: error
    })
  }
}
