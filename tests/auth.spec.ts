import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { resetDatabase } from './utils/db'

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
})

test('unauthenticated user visiting /admin is redirected to /login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: 'Log in to admin' })).toBeVisible()
})

test('authenticated user visiting /login is redirected to /admin', async ({ page }) => {
  await loginAdmin(page)
  // loginAdmin navigates to /admin — now go back to /login
  await page.goto('/login')
  await expect(page).toHaveURL(/\/admin/)
})
