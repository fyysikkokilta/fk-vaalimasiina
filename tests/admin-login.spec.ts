import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading')).toHaveText('Admin login')
})

test.describe('admin-login.spec.ts', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.fill('#username', 'admin')
    await page.fill('#password', 'password')
    await page.getByText('Submit').click()
    await expect(page.getByRole('heading')).toHaveText('Admin')
  })

  test('should not login with invalid credentials', async ({ page }) => {
    await page.fill('#username', 'admin')
    await page.fill('#password', 'wrong-password')
    await page.getByText('Submit').click()
    await expect(page.getByRole('heading')).toHaveText('Admin login')
  })
})
