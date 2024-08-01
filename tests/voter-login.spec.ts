import test, { expect } from '@playwright/test'
import { loginAdmin } from './utils/admin-login'
import { addVoter } from './utils/admin-voters'
import { expectNoToast, expectToast } from './utils/toast'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading')).toHaveText('Kirjaudu sisään')
})

test.describe('voter-login.spec.ts', () => {
  test('should login with correct voter code', async ({ page }) => {
    await loginAdmin(page)
    const voterCode = await addVoter(page)
    await page.goto('/')
    await page.fill('#formIdentifier', voterCode)
    await page.fill('#formAlias', 'alias')
    await page.getByRole('button', { name: 'Kirjaudu' }).click()
    await expect(page.getByRole('heading')).toHaveText('Äänestäminen')
    await expectNoToast(page)
  })

  test('should not login with invalid credentials', async ({ page }) => {
    await page.fill('#formIdentifier', 'invalid-voter-code')
    await page.fill('#formAlias', 'alias')
    await page.getByRole('button', { name: 'Kirjaudu' }).click()
    await expect(page.getByRole('heading')).toHaveText('Kirjaudu sisään')
    await expectToast(page, 'Invalid voter identifier')
  })

  test('should not login with empty voter code', async ({ page }) => {
    await page.fill('#formAlias', 'alias')
    await expect(page.getByRole('button', { name: 'Kirjaudu' })).toBeDisabled()
  })

  test('should not login with empty alias', async ({ page }) => {
    await loginAdmin(page)
    const voterCode = await addVoter(page)
    await page.goto('/')
    await page.fill('#formIdentifier', voterCode)
    await expect(page.getByRole('button', { name: 'Kirjaudu' })).toBeDisabled()
  })

  test('should not login with empty fields', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Kirjaudu' })).toBeDisabled()
  })

  test('should logout', async ({ page }) => {
    await loginAdmin(page)
    const voterCode = await addVoter(page)
    await page.goto('/')
    await page.fill('#formIdentifier', voterCode)
    await page.fill('#formAlias', 'alias')
    await page.getByRole('button', { name: 'Kirjaudu' }).click()
    await expectNoToast(page)
    await expect(page.getByRole('heading')).toHaveText('Äänestäminen')
    await page.getByRole('button', { name: 'Kirjaudu ulos' }).click()
    await expectNoToast(page)
    await expect(page.getByRole('heading')).toHaveText('Kirjaudu sisään')
  })
})
