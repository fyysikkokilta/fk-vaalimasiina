import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { insertElection, resetDatabase } from './utils/db'
import { clearTestEmails, getTestEmails, setSmtpFailure } from './utils/emails'

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  await clearTestEmails(request)
  await setSmtpFailure(request, false)
  await insertElection(
    {
      title: 'Email Test Election',
      description: 'Testing email delivery',
      seats: 1,
      candidates: [{ name: 'Candidate 1' }],
      status: 'CREATED'
    },
    request
  )
  await loginAdmin(page)
})

test('should capture emails for all voters when voting starts', async ({ page, request }) => {
  const emails = ['voter1@test.com', 'voter2@test.com', 'voter3@test.com']

  await page
    .getByLabel("Add the voters' email addresses here separated by line breaks")
    .fill(emails.join('\n'))
  await page.getByRole('button', { name: 'Start voting' }).click()

  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()

  const captured = await getTestEmails(request)
  expect(captured).toHaveLength(3)

  const recipients = captured.map((e) => e.to)
  for (const email of emails) {
    expect(recipients).toContain(email)
  }
})

test('email subject should contain the election title', async ({ page, request }) => {
  await page
    .getByLabel("Add the voters' email addresses here separated by line breaks")
    .fill('voter@test.com')
  await page.getByRole('button', { name: 'Start voting' }).click()

  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()

  const captured = await getTestEmails(request)
  expect(captured).toHaveLength(1)
  expect(captured[0].subject).toContain('Email Test Election')
})

test('email should contain Finnish and English voting links', async ({ page, request }) => {
  await page
    .getByLabel("Add the voters' email addresses here separated by line breaks")
    .fill('voter@test.com')
  await page.getByRole('button', { name: 'Start voting' }).click()

  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()

  const captured = await getTestEmails(request)
  expect(captured).toHaveLength(1)
  expect(captured[0].votingLinkFi).toContain('/fi/vote/')
  expect(captured[0].votingLinkEn).toContain('/en/vote/')
  // Both links should point to the same voter ID
  const voterIdFi = captured[0].votingLinkFi.split('/fi/vote/')[1]
  const voterIdEn = captured[0].votingLinkEn.split('/en/vote/')[1]
  expect(voterIdFi).toEqual(voterIdEn)
})

test('email voting links should be navigable', async ({ page, request }) => {
  await page
    .getByLabel("Add the voters' email addresses here separated by line breaks")
    .fill('voter@test.com')
  await page.getByRole('button', { name: 'Start voting' }).click()

  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()

  const captured = await getTestEmails(request)
  expect(captured).toHaveLength(1)

  // The English voting link should lead to the voting page
  await page.goto(captured[0].votingLinkEn)
  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
  await expect(page.getByText('Email Test Election')).toBeVisible()
})

test.describe('SMTP failure', () => {
  test('should not start voting when SMTP fails', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('voter@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()

    // Wait for the error alert to confirm the action has completed with failure,
    // then assert the page stayed on Preview (not navigated to Voting).
    await expect(page.getByText('Mail sending failed', { exact: false })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  })

  test('should show error alert when SMTP fails', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('voter@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()

    await expect(page.getByText('Mail sending failed', { exact: false })).toBeVisible()
  })

  test('should list all failed email addresses in the error message', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    const emails = ['first@test.com', 'second@test.com']
    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill(emails.join('\n'))
    await page.getByRole('button', { name: 'Start voting' }).click()

    await expect(page.getByText('first@test.com', { exact: false })).toBeVisible()
    await expect(page.getByText('second@test.com', { exact: false })).toBeVisible()
  })

  test('should not capture emails when SMTP fails', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('voter@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()

    // Wait for the action to complete (error appears) before checking capture
    await expect(page.getByText('Mail sending failed', { exact: false })).toBeVisible()

    const captured = await getTestEmails(request)
    expect(captured).toHaveLength(0)
  })

  test('error should clear after a successful start voting', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('voter@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()

    await expect(page.getByText('Mail sending failed', { exact: false })).toBeVisible()

    // Fix SMTP and try again
    await setSmtpFailure(request, false)

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('voter@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()

    await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
    await expect(page.getByText('Mail sending failed', { exact: false })).not.toBeVisible()
  })
})

test.describe('change email resend', () => {
  test.beforeEach(async ({ page }) => {
    // Start voting first so we have an ONGOING election with a voter
    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('original@test.com')
    await page.getByRole('button', { name: 'Start voting' }).click()
    await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
  })

  test('should resend email to the new address on change', async ({ page, request }) => {
    await clearTestEmails(request)

    await page.getByLabel('Email to change').fill('original@test.com')
    await page.getByLabel('New email').fill('new@test.com')
    await page.getByRole('button', { name: 'Change email' }).click()

    await expect(page.getByText('Email changed')).toBeVisible()

    const captured = await getTestEmails(request)
    expect(captured).toHaveLength(1)
    expect(captured[0].to).toBe('new@test.com')
  })

  test('should show error when SMTP fails on email change', async ({ page, request }) => {
    await setSmtpFailure(request, true)

    await page.getByLabel('Email to change').fill('original@test.com')
    await page.getByLabel('New email').fill('new@test.com')
    await page.getByRole('button', { name: 'Change email' }).click()

    await expect(page.getByText('Mail sending failed', { exact: false })).toBeVisible()
  })
})
