import { expect, Page } from '@playwright/test'

export const expectToast = async (page: Page, message: string) => {
  const toast = await page.locator('.Toastify').getByRole('alert')
  await expect(toast).toBeVisible()
  await expect(toast).toHaveText(message)
}

export const expectNoToast = async (page: Page) => {
  const toast = page.locator('.Toastify').getByRole('alert')
  await expect(toast).not.toBeVisible()
}
