import { Page } from '@playwright/test'

import { testClient } from '~/trpc/client'

export const loginAdmin = async (page: Page) => {
  const jwt = await testClient.test?.login.authenticate.mutate()

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
  await page.goto('./admin')
}
