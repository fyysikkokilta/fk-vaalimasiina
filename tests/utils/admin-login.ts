import { Page } from '@playwright/test'
import { SignJWT } from 'jose'

import { env } from '~/env'
import { JWT_COOKIE } from '~/utils/isAuthorized'

export const loginAdmin = async (page: Page) => {
  // Create a JWT token for the test admin user
  const jwt = await new SignJWT({
    user: {
      email: 'test@email.com',
      name: 'Test Admin'
    }
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('fk-vaalimasiina')
    .setExpirationTime('10h')
    .sign(new TextEncoder().encode(env.AUTH_SECRET))

  // Set the admin token cookie
  await page.context().addCookies([
    {
      name: JWT_COOKIE,
      value: jwt,
      url: 'http://localhost:3000',
      httpOnly: true
    }
  ])

  await page.goto('/admin')
}
