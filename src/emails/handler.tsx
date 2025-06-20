import { render } from '@react-email/components'
import Mailgun from 'mailgun.js'

import { env } from '~/env'

import EmailTemplate from './Email'

export interface VotingMailParams {
  election: {
    title: string
    description: string
    seats: number
  }
}

const getMailgunClient = () => {
  const mailgun = new Mailgun(FormData)
  if (!env.MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not set')
  }
  return mailgun.client({
    username: 'api',
    key: env.MAILGUN_API_KEY,
    url: env.MAILGUN_HOST
  })
}

export const sendVotingMail = async (
  to: { email: string; voterId: string }[],
  params: VotingMailParams
) => {
  if (env.NODE_ENV === 'development') {
    console.log('Sending voting mail to:', to)
    console.log('Params:', params)
    return true
  }
  try {
    const brandedParams = {
      ...params,
      branding: {
        footerText: env.BRANDING_MAIL_FOOTER_TEXT,
        footerLink: env.BRANDING_MAIL_FOOTER_LINK
      },
      // %recipient.voterId% is populated by Mailgun
      votingLinkFi: `${env.BASE_URL}/fi/vote/%recipient.voterId%`,
      votingLinkEn: `${env.BASE_URL}/en/vote/%recipient.voterId%`
    }

    const html = await render(<EmailTemplate {...brandedParams} />)
    const subjectPrefix = env.BRANDING_EMAIL_SUBJECT_PREFIX
    const subject = `${subjectPrefix} - ${params.election.title}`

    const emailParams = {
      to: to.map((voter) => voter.email),
      from: env.MAIL_FROM,
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

    if (!env.MAILGUN_DOMAIN) {
      throw new Error('MAILGUN_DOMAIN is not set')
    }

    await client.messages.create(env.MAILGUN_DOMAIN, emailParams)
    return true
  } catch (error) {
    console.error('Error sending voting mail:', error)
    return false
  }
}
