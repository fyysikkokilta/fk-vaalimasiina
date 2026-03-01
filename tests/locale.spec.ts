import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { insertElection, insertVoters, resetDatabase } from './utils/db'

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
})

test('Finnish login page renders in Finnish', async ({ page }) => {
  await page.goto('/fi/login')
  await expect(page.getByRole('heading', { name: 'Hallintaan kirjautuminen' })).toBeVisible()
})

test('Finnish admin redirect works for unauthenticated user', async ({ page }) => {
  await page.goto('/fi/admin')
  await expect(page).toHaveURL(/\/fi\/login/)
})

test('Finnish voting page renders in Finnish', async ({ request, page }) => {
  const election = await insertElection(
    {
      title: 'Test Election',
      description: 'Test',
      seats: 1,
      candidates: [{ name: 'Candidate 1' }],
      status: 'ONGOING'
    },
    request
  )
  const voters = await insertVoters({ electionId: election.electionId, emails: ['v@test.com'] })

  await page.goto(`/fi/vote/${voters[0].voterId}`)
  await expect(page.getByRole('heading', { name: 'Äänestäminen' })).toBeVisible()
})

test('Finnish admin page renders in Finnish after login', async ({ page }) => {
  await loginAdmin(page)
  await page.goto('/fi/admin')
  // The admin heading should be in Finnish
  await expect(page.getByRole('heading', { name: 'Hallinta' })).toBeVisible()
})
