import { expect,test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/admin')
})

test('should login with valid credentials', async ({ page }) => {
  await expect(page.getByRole('heading')).toHaveText('Log in to admin')
  await page.fill('#username', 'admin')
  await page.fill('#password', 'password')
  await page.getByRole('button').getByText('Log in').click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
})

test('should not login with invalid credentials', async ({ page }) => {
  await page.fill('#username', 'admin')
  await page.fill('#password', 'wrong-password')
  await page.getByRole('button').getByText('Log in').click()
  await expect(page.getByRole('heading')).toHaveText('Log in to admin')
})
