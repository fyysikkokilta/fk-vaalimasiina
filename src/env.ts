import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    PORT: z
      .string()
      .default('3000')
      .transform((val) => parseInt(val, 10)),
    DATABASE_URL: z.string().url(),
    ADMIN_USERNAME: z.string(),
    ADMIN_PASSWORD: z.string(),
    JWT_SECRET: z.string(),
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
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true'
})
