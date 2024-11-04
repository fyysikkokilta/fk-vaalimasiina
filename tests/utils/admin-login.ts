import { expect, Page } from '@playwright/test'

export const loginAdmin = async (page: Page) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading')).toHaveText('Log in to admin')
  await page.fill('#username', 'admin')
  await page.fill('#password', 'password')
  await page.getByRole('button').getByText('Log in').click()
  await expect(page.getByRole('heading', { name: 'Admin' })).toBeVisible()
}
