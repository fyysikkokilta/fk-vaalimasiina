import { Page } from '@playwright/test'
import { SignJWT } from 'jose'

import { env } from '~/env'

const TEST_ADMIN_EMAIL = 'test@email.com'

export const loginAdmin = async (page: Page) => {
  // Create a JWT token for the test admin user
  const jwt = await new SignJWT({ email: TEST_ADMIN_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('fk-vaalimasiina')
    .setExpirationTime('10h')
    .sign(new TextEncoder().encode(env.AUTH_SECRET))

  // Set the admin token cookie
  await page.context().addCookies([
    {
      name: 'admin-token',
      value: jwt,
      url: 'http://localhost:3000',
      httpOnly: true
    }
  ])
  
  await page.goto('/admin')
}