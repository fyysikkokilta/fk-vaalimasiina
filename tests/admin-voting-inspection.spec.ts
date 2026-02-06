import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import {
  Election,
  insertElection,
  insertVoters,
  insertVotes,
  resetDatabase,
  Voter
} from './utils/db'

let election: Election
let voters: Voter[]

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  election = await insertElection(
    {
      title: 'Election 1',
      description: 'Description 1',
      seats: 1,
      candidates: [{ name: 'Candidate 1' }],
      status: 'ONGOING'
    },
    request
  )
  voters = await insertVoters({
    electionId: election.electionId,
    emails: Array.from({ length: 4 }, (_, i) => `email${i + 1}@email.com`)
  })
  await loginAdmin(page)
})

test('should show voting form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'End voting' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Abort voting' })).toBeVisible()
})

test('should show correct amount of voters', async ({ page }) => {
  await expect(page.getByText('Voters: 4')).toBeVisible()
})

test.describe('with no given votes', () => {
  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.getByText('Given votes: 0')).toBeVisible()
  })

  test('should list all remaining voters', async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('email1@email.com')).toBeVisible()
    await expect(page.getByText('email2@email.com')).toBeVisible()
    await expect(page.getByText('email3@email.com')).toBeVisible()
    await expect(page.getByText('email4@email.com')).toBeVisible()
  })

  test('should not allow to end voting', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'End voting' })
    ).toBeDisabled()
  })
})

test.describe('with some votes', () => {
  test.beforeEach(async () => {
    await insertVotes({
      electionId: election.electionId,
      voterIdBallotPairs: [
        {
          voterId: voters[0].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        },
        {
          voterId: voters[1].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        }
      ]
    })
  })

  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.getByText('Given votes: 2')).toBeVisible()
  })

  test('should list only remaining voters', async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('email3@email.com')).toBeVisible()
    await expect(page.getByText('email4@email.com')).toBeVisible()
    await expect(page.getByText('email1@email.com')).not.toBeVisible()
    await expect(page.getByText('email2@email.com')).not.toBeVisible()
  })

  test("shouldn't allow to end voting", async ({ page }) => {
    await expect(
      page.getByRole('button', { name: 'End voting' })
    ).toBeDisabled()
  })

  test('should allow to abort voting', async ({ page }) => {
    await page.getByRole('button', { name: 'Abort voting' }).click()
    await expect(
      page.getByRole('heading', { name: 'Election 1' })
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  })
})

test.describe('with all votes', () => {
  test.beforeEach(async () => {
    await insertVotes({
      electionId: election.electionId,
      voterIdBallotPairs: [
        {
          voterId: voters[0].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        },
        {
          voterId: voters[1].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        },
        {
          voterId: voters[2].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        },
        {
          voterId: voters[3].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              rank: 1
            }
          ]
        }
      ]
    })
  })

  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.getByText('Given votes: 4')).toBeVisible()
  })

  test('should show no remaining voters message', async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('Everyone has voted')).toBeVisible()
  })

  test('should allow to end voting', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'End voting' })).toBeEnabled()
    await page.getByRole('button', { name: 'End voting' }).click()
    await expect(
      page.getByRole('heading', { name: 'Results', exact: true })
    ).toBeVisible()
  })
})

test.describe('change email form', () => {
  test('should allow to change email', async ({ page }) => {
    await page.getByLabel('Email to change').fill('email4@email.com')
    await page.getByLabel('New email').fill('email5@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(page.getByText('Email changed')).toBeVisible()
  })

  test("shouldn't allow to change email with invalid email", async ({
    page
  }) => {
    await page.getByLabel('Email to change').fill('email4@email.com')
    await page.getByLabel('New email').fill('email5')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(
      page.getByText('New email must be a valid email')
    ).toBeVisible()
  })

  test("shouldn't allow to change an old email that doesn't exist", async ({
    page
  }) => {
    await page.getByLabel('Email to change').fill('email5@email.com')
    await page.getByLabel('New email').fill('email6@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(page.getByText('Voter not found')).toBeVisible()
  })

  test("shouldn't allow to change email to one that exists", async ({
    page
  }) => {
    await page.getByLabel('Email to change').fill('email4@email.com')
    await page.getByLabel('New email').fill('email3@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(page.getByText('Email already exists')).toBeVisible()
  })
})
