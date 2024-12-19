import { expect, test } from '@playwright/test'

import { Election, Voter } from '../types/types'
import { loginAdmin } from './utils/admin-login'
import {
  insertElection,
  insertVoters,
  insertVotes,
  resetDatabase
} from './utils/db'
import { expectToast } from './utils/toast'

let election: Election
let voters: Voter[]

test.beforeEach(async ({ page }) => {
  await resetDatabase()
  election = await insertElection({
    title: 'Election 1',
    description: 'Description 1',
    seats: 1,
    candidates: [{ name: 'Candidate 1' }],
    status: 'ONGOING'
  })
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
  await expect(page.locator('text=Voters: 4')).toBeVisible()
})

test.describe('with no given votes', () => {
  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.locator('text=Given votes: 0')).toBeVisible()
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
              preferenceNumber: 1
            }
          ]
        },
        {
          voterId: voters[1].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              preferenceNumber: 1
            }
          ]
        }
      ]
    })
  })

  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.locator('text=Given votes: 2')).toBeVisible()
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
              preferenceNumber: 1
            }
          ]
        },
        {
          voterId: voters[1].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              preferenceNumber: 1
            }
          ]
        },
        {
          voterId: voters[2].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              preferenceNumber: 1
            }
          ]
        },
        {
          voterId: voters[3].voterId,
          ballot: [
            {
              candidateId: election.candidates[0].candidateId,
              preferenceNumber: 1
            }
          ]
        }
      ]
    })
  })

  test('should show correct vote numbers', async ({ page }) => {
    await expect(page.locator('text=Given votes: 4')).toBeVisible()
  })

  test('should allow to end voting', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'End voting' })).toBeEnabled()
    await page.getByRole('button', { name: 'End voting' }).click()
    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
  })
})

test.describe('change email form', () => {
  test('should allow to change email', async ({ page }) => {
    await page.fill('#oldEmail', 'email4@email.com')
    await page.fill('#newEmail', 'email5@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expectToast(page, 'Email changed')
  })

  test("shouldn't allow to change email with invalid email", async ({
    page
  }) => {
    await page.fill('#oldEmail', 'email4@email.com')
    await page.fill('#newEmail', 'email5')
    await expect(
      page.getByRole('button', { name: 'Change email' })
    ).toBeDisabled()
  })

  test("shouldn't allow to change an old email that doesn't exist", async ({
    page
  }) => {
    await page.fill('#oldEmail', 'email5@email.com')
    await page.fill('#newEmail', 'email6@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expectToast(page, 'Voter not found')
  })

  test("shouldn't allow to change email to one that exists", async ({
    page
  }) => {
    await page.fill('#oldEmail', 'email4@email.com')
    await page.fill('#newEmail', 'email3@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expectToast(page, '', true)
  })
})
