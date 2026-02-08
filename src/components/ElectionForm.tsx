'use client'

import { Form } from '@base-ui/react/form'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { z } from 'zod'

import { Button } from '~/components/ui/Button'
import { Field, inputClassName } from '~/components/ui/Field'

type ElectionFormData = {
  electionId?: string
  title: string
  description: string
  seats: number
  candidates: string[]
}

type ElectionFormDataEdit = ElectionFormData & { electionId: string }

export default function ElectionForm({
  formId,
  election,
  addCandidate,
  removeCandidate,
  onValidSubmit,
  isEdit = false
}: {
  formId: string
  election: ElectionFormData
  addCandidate: (candidateName: string) => void
  removeCandidate: (index: number) => void
  onValidSubmit: (data: ElectionFormData | ElectionFormDataEdit) => void
  isEdit?: boolean
}) {
  const t = useTranslations('ElectionForm')
  const [newCandidate, setNewCandidate] = useState('')
  const [errors, setErrors] = useState<Record<string, string | string[]> | undefined>(undefined)
  const [formErrors, setFormErrors] = useState<string[]>([])

  const createSchema = z
    .object({
      title: z.string(t('validation.title_string')).min(1, t('validation.title_nonempty')),
      description: z
        .string(t('validation.description_string'))
        .min(1, t('validation.description_nonempty')),
      seats: z.coerce.number(t('validation.seats_number')).min(1, t('validation.seats_min')),
      candidates: z
        .array(
          z.string(t('validation.candidate_string')).min(1, t('validation.candidate_nonempty')),
          t('validation.candidates_array')
        )
        .min(1, t('validation.candidates_nonempty'))
    })
    .refine((data) => data.candidates.length >= data.seats, {
      message: t('validation.candidates_geq_seats'),
      path: ['candidates']
    })

  const editSchema = createSchema.extend({
    electionId: z.uuid(t('validation.electionId_uuid'))
  })

  const handleFormSubmit = (formValues: Record<string, string | number>) => {
    const toParse = {
      ...formValues,
      electionId: election?.electionId,
      candidates: election.candidates
    }

    const schema = isEdit ? editSchema : createSchema
    const result = schema.safeParse(toParse)

    if (!result.success) {
      const flattened = z.flattenError(result.error)
      setErrors(flattened.fieldErrors)
      setFormErrors(flattened.formErrors)
      return
    }

    setNewCandidate('')
    setErrors(undefined)
    setFormErrors([])
    onValidSubmit(result.data as ElectionFormData | ElectionFormDataEdit)
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Form id={formId} errors={errors} onFormSubmit={handleFormSubmit} className="contents">
        <div className="contents">
          {formErrors.length > 0 && (
            <div className="col-span-full space-y-1 text-red-600">
              {formErrors.map((err) => (
                <div key={err} role="alert">
                  {err}
                </div>
              ))}
            </div>
          )}
          <div>
            <Field.Root name="title">
              <Field.Label>{t('election_title')}</Field.Label>
              <Field.Control type="text" defaultValue={election.title} />
              <Field.Error />
            </Field.Root>
            <div className="mt-4 mb-4">
              <Field.Root name="description">
                <Field.Label>{t('description')}</Field.Label>
                <Field.Control
                  render={(props: React.ComponentProps<'textarea'>) => (
                    <textarea
                      {...props}
                      name="description"
                      rows={4}
                      defaultValue={election.description}
                      className={inputClassName}
                    />
                  )}
                />
                <Field.Error />
              </Field.Root>
            </div>
            <Field.Root name="seats">
              <Field.Label>{t('seats')}</Field.Label>
              <Field.Control type="number" min={1} defaultValue={election.seats} />
              <Field.Error />
            </Field.Root>
          </div>
          <div>
            <div className="mb-4">
              <label
                htmlFor="newCandidate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('new_candidate')}
              </label>
              <div className="flex gap-2">
                <input
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  type="text"
                  id="newCandidate"
                  className={inputClassName}
                />
                <Button
                  type="button"
                  variant="primary"
                  disabled={!newCandidate || newCandidate.trim() === ''}
                  onClick={() => {
                    addCandidate(newCandidate)
                    setNewCandidate('')
                  }}
                >
                  {t('add_candidate')}
                </Button>
              </div>
              {errors?.candidates && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  {Array.isArray(errors.candidates) ? errors.candidates[0] : errors.candidates}
                </p>
              )}
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('candidates')}
              </label>
              <ul className="space-y-2">
                {election.candidates.map((candidate, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <span className="font-medium">{candidate}</span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      onClick={() => removeCandidate(i)}
                    >
                      {t('remove_candidate')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Form>
    </div>
  )
}
