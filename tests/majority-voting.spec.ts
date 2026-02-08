import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import {
  createMajorityElectionWithVotersAndBallots,
  insertElection,
  insertVoters,
  resetDatabase
} from './utils/db'

test.describe('majority voting', () => {
  test.beforeEach(async ({ request }) => {
    await resetDatabase(request)
  })

  test('should show single-choice UI for majority election', async ({ page, request }) => {
    const election = await insertElection(
      {
        title: 'Majority Election',
        description: 'Pick one',
        seats: 1,
        candidates: [{ name: 'Alice' }, { name: 'Bob' }],
        status: 'ONGOING',
        votingMethod: 'MAJORITY'
      },
      request
    )
    const [voter] = await insertVoters({
      electionId: election.electionId,
      emails: ['voter@test.com']
    })

    await page.goto(`/vote/${voter.voterId}`)

    await expect(page.getByRole('heading', { name: 'Majority Election' })).toBeVisible()
    await expect(page.getByText('Choose one candidate (or abstain).')).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Abstain (no choice)' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Alice' })).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Bob' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Vote' })).toBeVisible()
  })

  test('should allow voter to select one candidate and submit vote', async ({ page, request }) => {
    const { voters } = await createMajorityElectionWithVotersAndBallots(
      'Majority Election',
      'Pick one',
      1,
      'ONGOING',
      ['Alice', 'Bob'],
      ['voter@test.com'],
      request
    )
    const voter = voters[0]

    await page.goto(`/vote/${voter.voterId}`)

    await page.getByRole('radio', { name: 'Alice' }).check()
    await page.getByRole('button', { name: 'Vote' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByText('Alice')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
  })

  test('should allow voter to abstain and submit vote', async ({ page, request }) => {
    const { voters } = await createMajorityElectionWithVotersAndBallots(
      'Majority Election',
      'Pick one',
      1,
      'ONGOING',
      ['Alice', 'Bob'],
      ['voter@test.com'],
      request
    )

    await page.goto(`/vote/${voters[0].voterId}`)

    await page.getByRole('radio', { name: 'Abstain (no choice)' }).check()
    await page.getByRole('button', { name: 'Vote' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
  })

  test('should show ballot ID button after voting', async ({ page, request }) => {
    const { voters } = await createMajorityElectionWithVotersAndBallots(
      'Majority Election',
      'Pick one',
      1,
      'ONGOING',
      ['Alice', 'Bob'],
      ['voter@test.com'],
      request
    )

    await page.goto(`/vote/${voters[0].voterId}`)
    await page.getByRole('radio', { name: 'Bob' }).check()
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByRole('button', { name: 'Copy ballot ID' })).toBeVisible()
  })
})

test.describe('majority results', () => {
  test.beforeEach(async ({ request }) => {
    await resetDatabase(request)
  })

  test('should show majority results in admin after election is finished', async ({
    page,
    request
  }) => {
    await createMajorityElectionWithVotersAndBallots(
      'Majority Result Election',
      'Test majority result',
      1,
      'FINISHED',
      ['Candidate A', 'Candidate B'],
      ['v1@test.com', 'v2@test.com'],
      request,
      [{ candidateIndex: 0 }, { candidateIndex: 0 }]
    )

    await loginAdmin(page)
    await page.goto('/admin')

    await expect(page.getByRole('heading', { name: 'Majority Result Election' })).toBeVisible()
    await expect(page.getByText('Initial votes')).toBeVisible()
    const initialVotesSection = page.locator('section.bg-blue-50')
    await expect(initialVotesSection.getByText('2', { exact: true }).first()).toBeVisible()
    await expect(initialVotesSection.getByText('1', { exact: true }).first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Candidate' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Votes' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Round' })).not.toBeVisible()

    await expect(page.getByRole('row', { name: /Candidate A/ }).getByText('2')).toBeVisible()
    await expect(page.getByRole('row', { name: /Candidate B/ }).getByText('0')).toBeVisible()
    await expect(page.getByRole('row', { name: /Candidate A/ }).getByText('Elected')).toBeVisible()
  })

  test('should show majority results on public results page when election is closed', async ({
    page,
    request
  }) => {
    const { election } = await createMajorityElectionWithVotersAndBallots(
      'Public Majority Election',
      'Closed majority',
      1,
      'CLOSED',
      ['Option X', 'Option Y'],
      ['a@test.com', 'b@test.com'],
      request,
      [{ candidateIndex: 0 }, { candidateIndex: 1 }]
    )

    await page.goto(`/elections/${election.electionId}`)

    await expect(page.getByRole('heading', { name: 'Public Majority Election' })).toBeVisible()
    await expect(page.getByText('Initial votes')).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Votes' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Round' })).not.toBeVisible()

    const table = page.locator('table')
    await expect(
      table.getByRole('row').filter({ hasText: 'Option X' }).getByText('1')
    ).toBeVisible()
    await expect(
      table.getByRole('row').filter({ hasText: 'Option Y' }).getByText('1')
    ).toBeVisible()
    // Tie (1–1): one candidate is elected by tie-break; exactly one row shows Elected
    await expect(table.getByRole('row').filter({ hasText: 'Elected' })).toHaveCount(1)
  })

  test('should show winner when one candidate has more votes', async ({ page, request }) => {
    await createMajorityElectionWithVotersAndBallots(
      'Single Winner Majority',
      'One winner',
      1,
      'FINISHED',
      ['First', 'Second', 'Third'],
      ['a@test.com', 'b@test.com', 'c@test.com'],
      request,
      [{ candidateIndex: 1 }, { candidateIndex: 1 }, { candidateIndex: 0 }]
    )

    await loginAdmin(page)
    await page.goto('/admin')

    await expect(page.getByRole('row', { name: /Second/ }).getByText('2')).toBeVisible()
    await expect(page.getByRole('row', { name: /Second/ }).getByText('Elected')).toBeVisible()
  })
})
