import { expect, Page } from '@playwright/test'

export const expectToast = async (
  page: Page,
  message: string,
  noAssertText: boolean = false
) => {
  const toast = page.locator('.Toastify').getByRole('alert')
  await expect(toast).toBeVisible()

  if (!noAssertText) {
    await expect(toast.getByText(message)).toBeVisible()
  }
}

export const expectNoToast = async (page: Page) => {
  const toast = page.locator('.Toastify').getByRole('alert')
  await expect(toast).not.toBeVisible()
}
