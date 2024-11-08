import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import {
  insertElection,
  insertVoters,
  insertVotes,
  resetDatabase
} from './utils/db'
import { Election, Voter } from '../types/types'

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
    emails: [
      'email1@email.com',
      'email2@email.com',
      'email3@email.com',
      'email4@email.com'
    ]
  })
  await loginAdmin(page)
  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
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

test('should show remaining voters list', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Show remaining voters' })
  ).toBeVisible()
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

  test('should have emails in the remaining voters list', async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('email.com')).toHaveCount(4)
    await expect(page.getByText('email1')).toBeVisible()
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

  test('should have emails in the remaining voters list', async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('email.com')).toHaveCount(4)
    await expect(page.getByText('email1')).not.toBeVisible()
    await expect(page.getByText('email2')).not.toBeVisible()
    await expect(page.getByText('email3')).toBeVisible()
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

  test("should't have amy emails in the remaining voters list", async ({
    page
  }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
    await expect(page.getByText('email.com')).toHaveCount(0)
    await expect(page.getByText('email1')).not.toBeVisible()
    await expect(page.getByText('email2')).not.toBeVisible()
    await expect(page.getByText('email3')).not.toBeVisible()
    await expect(page.getByText('email4')).not.toBeVisible()
  })
})

test.describe('change email form', () => {
  test.beforeEach(async ({ page }) => {
    await page.getByRole('button', { name: 'Show remaining voters' }).click()
  })

  test('should allow to change email', async ({ page }) => {
    await page.fill('#oldEmail', 'email4@email.com')
    await page.fill('#newEmail', 'email5@email.com')
    await page.getByRole('button', { name: 'Change email' }).click()
    await expect(page.getByText('email5@email.com')).toBeVisible()
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
    await expect(
      page.getByRole('button', { name: 'Change email' })
    ).toBeDisabled()
  })

  test("shouldn't allow to change email to one that exists", async ({
    page
  }) => {
    await page.fill('#oldEmail', 'email4@email.com')
    await page.fill('#newEmail', 'email3@email.com')
    await expect(
      page.getByRole('button', { name: 'Change email' })
    ).toBeDisabled()
  })
})
