'use client'

import { Form } from '@base-ui/react/form'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { z } from 'zod'

import { abortVoting } from '~/actions/admin/abortVoting'
import { changeEmail } from '~/actions/admin/changeEmail'
import { endVoting } from '~/actions/admin/endVoting'
import { pollVotes } from '~/actions/admin/pollVotes'
import AdminNavigation from '~/components/AdminNavigation'
import { Button } from '~/components/ui/Button'
import { Field } from '~/components/ui/Field'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function VotingInspection({
  election: { electionId, title, description },
  voters
}: ElectionStepProps) {
  const [showRemainingVoters, setShowRemainingVoters] = useState(false)
  const [errors, setErrors] = useState<Record<string, string | string[]> | undefined>(undefined)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const t = useTranslations('VotingInspection')

  const changeEmailSchema = z.object({
    oldEmail: z.email(t('validation.oldEmail_email')),
    newEmail: z.email(t('validation.newEmail_email'))
  })

  const { execute: executeAbort, status: abortActionStatus } = useAction(abortVoting)

  const { execute: executeVoting, status: votingActionStatus } = useAction(endVoting)

  const { execute: executeEmail, status: emailActionStatus } = useAction(changeEmail, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        setSuccessMessage(data.message)
        setTimeout(() => setSuccessMessage(null), 3000)
      }
      setErrors(undefined)
    },
    onError: ({ error }) => {
      if (error.serverError) {
        setErrors({ serverError: [error.serverError] })
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      void pollVotes()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  const handleChangeEmailSubmit = (formValues: Record<string, string>) => {
    const result = changeEmailSchema.safeParse(formValues)
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors)
      setSuccessMessage(null)
      return
    }
    setErrors(undefined)
    setSuccessMessage(null)
    executeEmail(result.data)
  }

  return (
    <AdminNavigation
      electionStep={ElectionStep.VOTING}
      previousActionStatus={abortActionStatus}
      nextActionStatus={votingActionStatus}
      disableNext={remainingVoters.length > 0}
      onBack={() => executeAbort({ electionId })}
      onNext={() => executeVoting({ electionId })}
    >
      <div className="mx-auto max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p className="mb-4 text-center">{description}</p>
          <div className="w-full space-y-2 rounded-lg border border-gray-200 p-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('given_votes')}
                {': '}
                {votersWhoVoted.length}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('voters')}
                {': '}
                {voters.length}
              </span>
            </div>
          </div>
          <Form
            errors={errors}
            onFormSubmit={handleChangeEmailSubmit}
            className="mt-6 w-full space-y-4"
          >
            {successMessage && (
              <div
                className="rounded-lg border border-green-200 bg-green-50 p-3 text-green-800"
                role="alert"
              >
                {successMessage}
              </div>
            )}
            {errors?.serverError && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
                role="alert"
              >
                {Array.isArray(errors.serverError) ? errors.serverError[0] : errors.serverError}
              </div>
            )}
            <Field.Root name="oldEmail">
              <Field.Label>{t('old_email')}</Field.Label>
              <Field.Control />
              <Field.Error />
            </Field.Root>
            <Field.Root name="newEmail">
              <Field.Label>{t('new_email')}</Field.Label>
              <Field.Control />
              <Field.Error />
            </Field.Root>
            <Button type="submit" variant="yellow" actionStatus={emailActionStatus}>
              {t('change_email')}
            </Button>
          </Form>
          <div className="mt-6 w-full">
            <div className="mb-3 flex justify-center">
              <Button
                type="button"
                variant="yellow"
                onClick={() => setShowRemainingVoters((value) => !value)}
              >
                {showRemainingVoters ? t('hide_remaining_voters') : t('show_remaining_voters')}
              </Button>
            </div>
            {showRemainingVoters &&
              (remainingVoters.length === 0 ? (
                <div className="text-center text-sm text-gray-600">
                  {t('remaining_voters_empty')}
                </div>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {remainingVoters.map((voter) => (
                    <li
                      key={voter.email}
                      className="rounded-lg border border-gray-200 p-3 text-center"
                    >
                      {voter.email}
                    </li>
                  ))}
                </ul>
              ))}
          </div>
        </div>
      </div>
    </AdminNavigation>
  )
}
