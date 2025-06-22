import { Page } from '@playwright/test'

import { authenticate } from './routes/login'

export const loginAdmin = async (page: Page) => {
  const jwt = await authenticate()

  if (!jwt) {
    throw new Error('Failed to login')
  }

  await page.context().addCookies([
    {
      name: 'admin-token',
      value: jwt,
      url: 'http://localhost:3000'
    }
  ])
  await page.goto('/admin')
}
