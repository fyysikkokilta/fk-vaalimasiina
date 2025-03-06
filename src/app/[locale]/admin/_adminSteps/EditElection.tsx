'use client'

import { useTranslations } from 'next-intl'
import { InferSafeActionFnInput } from 'next-safe-action'
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import { cancelEditing } from '~/actions/admin/election/cancelEditing'
import { editElection } from '~/actions/admin/election/editElection'
import AdminNavigation from '~/components/AdminNavigation'
import ElectionForm from '~/components/ElectionForm'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function EditElection({ election }: ElectionStepProps) {
  const [newCandidate, setNewCandidate] = useState('')
  const [editedElection, setEditedElection] = useState<
    InferSafeActionFnInput<typeof editElection>['parsedInput']
  >({
    ...election,
    candidates: election.candidates.map((candidate) => candidate.name) as [
      string,
      ...string[]
    ]
  })

  const t = useTranslations('admin.admin_main.new_election')

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNumber: boolean = false
  ) => {
    setEditedElection((electionState) => ({
      ...electionState,
      [event.target.name]: isNumber
        ? parseInt(event.target.value, 10) || ''
        : event.target.value
    }))
  }

  const addCandidate = (candidateName: string) => {
    setEditedElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, candidateName]
    }))
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setEditedElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates as [string, ...string[]]
      }
    })
  }
  const { execute: executeCancel, isPending: isPendingCancel } = useAction(
    cancelEditing,
    {
      onSuccess: ({ data }) => {
        if (data?.message) {
          toast.success(data.message)
        }
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError)
        }
      }
    }
  )

  const {
    execute: executeEdit,
    isPending: isPendingEdit,
    result: resultEdit
  } = useAction(editElection, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      } else {
        toast.error(t('invalid_election_data'))
      }
    }
  })

  return (
    <AdminNavigation
      electionStep={ElectionStep.EDIT}
      disablePrevious={isPendingCancel}
      disableNext={isPendingEdit}
      onBack={() => executeCancel({ electionId: election.electionId })}
      onNext={() => executeEdit(editedElection)}
    >
      <ElectionForm
        result={resultEdit}
        election={editedElection}
        newCandidate={newCandidate}
        setNewCandidate={setNewCandidate}
        handleChange={handleChange}
        addCandidate={addCandidate}
        removeCandidate={removeCandidate}
      />
    </AdminNavigation>
  )
}
