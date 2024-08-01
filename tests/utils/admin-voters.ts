import { expect, Page } from '@playwright/test'

export const addVoter = async (page: Page) => {
  await page.goto('/admin/voters')
  await expect(page.getByRole('heading')).toHaveText([
    'Admin',
    'Äänestäjähallinta',
  ])
  await page.getByRole('button', { name: 'Generoi' }).click()
  const newVoterAlert = await page.getByRole('alert')
  await expect(newVoterAlert).toContainText('Uusi äänestäjäkoodi:')
  const voterCode = (await newVoterAlert.innerText()).match(
    /Uusi äänestäjäkoodi: (VOTER-[A-Za-z0-9]{9})/
  )![1]
  return voterCode
}
