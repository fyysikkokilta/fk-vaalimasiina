'use client'

import { Form } from '@base-ui/react/form'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { type ComponentProps, useState } from 'react'
import { z } from 'zod'

import { startEditing } from '~/actions/admin/startEditing'
import { startVoting } from '~/actions/admin/startVoting'
import AdminNavigation from '~/components/AdminNavigation'
import { Field, inputClassName } from '~/components/ui/Field'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

const PREVIEW_EMAILS_FORM_ID = 'preview-emails-form'

function getEmails(emailsText: string): string[] {
  return emailsText
    .split('\n')
    .map((email) => email.trim())
    .map((email) => email.toLowerCase())
    .filter(Boolean)
}

export default function PreviewElection({
  election: { electionId, title, description, seats, votingMethod, candidates }
}: ElectionStepProps) {
  const [errors, setErrors] = useState<Record<string, string | string[]> | undefined>(undefined)

  const t = useTranslations('PreviewElection')

  const emailsSchema = z.object({
    emails: z
      .array(z.email(t('validation.email_email')), t('validation.emails_array'))
      .min(1, t('validation.emails_nonempty'))
      .refine((items) => new Set(items).size === items.length, t('validation.emails_unique'))
  })

  const { execute: executeEditing, status: editingActionStatus } = useAction(startEditing)

  const { execute: executeVoting, status: votingActionStatus } = useAction(startVoting)

  const handleFormSubmit = (formValues: Record<string, string>) => {
    const emailsList = getEmails(formValues.emails ?? '')
    const result = emailsSchema.safeParse({ emails: emailsList })
    if (!result.success) {
      setErrors(z.flattenError(result.error).fieldErrors)
      return
    }
    setErrors(undefined)
    executeVoting({
      electionId,
      emails: result.data.emails
    })
  }

  return (
    <AdminNavigation
      electionStep={ElectionStep.PREVIEW}
      formId={PREVIEW_EMAILS_FORM_ID}
      previousActionStatus={editingActionStatus}
      nextActionStatus={votingActionStatus}
      onBack={() => executeEditing({ electionId })}
      onNext={() => {}}
    >
      <Form id={PREVIEW_EMAILS_FORM_ID} errors={errors} onFormSubmit={handleFormSubmit}>
        <div className="mx-auto max-w-lg p-6">
          <div className="flex flex-col items-center">
            <h3 className="mb-3 text-xl font-semibold">{title}</h3>
            <p className="mb-3 text-center">{description}</p>
            <div className="mb-3">
              {t('seats')}
              {': '}
              {seats}
            </div>
            <div className="mb-3">
              {t('voting_method')}
              {': '}
              {votingMethod === 'MAJORITY' ? t('voting_method_majority') : t('voting_method_stv')}
            </div>
            <h4 className="mb-2 font-medium">{t('candidates')}</h4>
            <ul className="w-full space-y-2">
              {candidates.map((candidate, index) => (
                <li key={candidate.candidateId} className="rounded-lg border border-gray-200 p-3">
                  {index + 1}
                  {'. '}
                  {candidate.name}
                </li>
              ))}
            </ul>
            <h4 className="mt-6 font-medium">{t('voters')}</h4>
            <div className="w-full">
              <Field.Root name="emails">
                <Field.Label>{t('email_list_instruction')}</Field.Label>
                <Field.Control
                  render={(props: ComponentProps<'textarea'>) => (
                    <textarea
                      {...props}
                      name="emails"
                      rows={5}
                      defaultValue=""
                      placeholder={t('email_list_placeholder')}
                      className={inputClassName}
                    />
                  )}
                />
                <Field.Error />
              </Field.Root>
            </div>
          </div>
        </div>
      </Form>
    </AdminNavigation>
  )
}
