import { expect, Page } from '@playwright/test'

export const loginAdmin = async (page: Page) => {
  await page.goto('/admin')
  await expect(page.getByRole('heading')).toHaveText('Admin login')
  await page.fill('#username', 'admin')
  await page.fill('#password', 'password') //TODO: Hide to env or something
  await page.click('text=Submit')
  await expect(page.getByRole('heading')).toHaveText('Admin')
}
