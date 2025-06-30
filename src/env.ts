import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z
      .string()
      .default('3000')
      .transform((val) => parseInt(val, 10)),
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    ADMIN_EMAILS: z.string().transform((val) =>
      val
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0)
    ),
    BASE_URL: z.string().url().default('https://vaalit.fyysikkokilta.fi'),
    MAIL_FROM: z.string().default('Vaalimasiina <vaalit@fyysikkokilta.fi>'),
    MAILGUN_API_KEY: z.string().optional(),
    MAILGUN_DOMAIN: z.string().optional(),
    MAILGUN_HOST: z.string().url().default('https://api.eu.mailgun.net'),
    BRANDING_EMAIL_SUBJECT_PREFIX: z.string().default('Vaalimasiina'),
    BRANDING_MAIL_FOOTER_TEXT: z.string().default('Rakkaudella Fysistit'),
    BRANDING_MAIL_FOOTER_LINK: z
      .string()
      .url()
      .default('https://fyysikkokilta.fi'),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_BUCKET_NAME: z.string().optional(),
    S3_ENDPOINT: z.string().url().optional(),
    S3_REGION: z.string().default('auto'),
    ANALYZE: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development')
  },
  client: {
    NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT: z.string().default('Vaalimasiina'),
    NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT: z
      .string()
      .default('Vaalimasiina'),
    NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT: z
      .string()
      .default('fyysikkokilta.fi'),
    NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK: z
      .string()
      .url()
      .default('https://fyysikkokilta.fi')
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT:
      process.env.NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT,
    NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT:
      process.env.NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT,
    NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT:
      process.env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_TEXT,
    NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK:
      process.env.NEXT_PUBLIC_BRANDING_FOOTER_HOME_LINK
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true'
})
