import { render } from '@react-email/components'
import nodemailer from 'nodemailer'

import { env } from '~/env'

import EmailTemplate from './Email'

export interface VotingMailParams {
  election: {
    title: string
    description: string
    seats: number
  }
}

const getSmtpTransporter = () => {
  if (!env.SMTP_HOST) {
    throw new Error('SMTP_HOST is not set')
  }
  if (!env.SMTP_USER) {
    throw new Error('SMTP_USER is not set')
  }
  if (!env.SMTP_PASSWORD) {
    throw new Error('SMTP_PASSWORD is not set')
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD
    }
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
    const subjectPrefix = env.BRANDING_EMAIL_SUBJECT_PREFIX
    const subject = `${subjectPrefix} - ${params.election.title}`

    const transporter = getSmtpTransporter()

    // Send individual emails to each voter with personalized links
    const emailPromises = to.map(async (voter) => {
      const brandedParams = {
        ...params,
        branding: {
          footerText: env.BRANDING_MAIL_FOOTER_TEXT,
          footerLink: env.BRANDING_MAIL_FOOTER_LINK
        },
        votingLinkFi: `${env.NEXT_PUBLIC_BASE_URL}/fi/vote/${voter.voterId}`,
        votingLinkEn: `${env.NEXT_PUBLIC_BASE_URL}/en/vote/${voter.voterId}`
      }

      const html = await render(<EmailTemplate {...brandedParams} />)

      return transporter.sendMail({
        from: env.MAIL_FROM,
        to: voter.email,
        subject,
        html
      })
    })

    await Promise.all(emailPromises)
    return true
  } catch (error) {
    console.error('Error sending voting mail:', error)
    return false
  }
}
