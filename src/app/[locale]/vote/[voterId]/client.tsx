'use client'

import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import { vote } from '~/actions/vote'
import DroppableContainer from '~/components/DroppableContainer'
import SortableItem from '~/components/SortableItem'
import TitleWrapper from '~/components/TitleWrapper'
import type { VotePageProps } from '~/data/getVoter'
import { Link } from '~/i18n/navigation'

export default function Vote({ election, voter }: VotePageProps) {
  const [confirmingVote, setConfirmingVote] = useState(false)
  const [disableVote, setDisableVote] = useState(false)
  const [candidates, setCandidates] = useState({
    selectedCandidates: [] as string[],
    availableCandidates: election.candidates.map((c) => c.candidateId)
  })

  const selectedCandidates = candidates.selectedCandidates
  const availableCandidates = candidates.availableCandidates

  const t = useTranslations('Vote')
  const { execute, isPending, result } = useAction(vote, {
    onExecute: () => setDisableVote(true),
    onSuccess: ({ data }) => {
      setConfirmingVote(false)
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      setDisableVote(false)
      if (error.serverError) {
        toast.error(error.serverError)
      } else {
        toast.error(t('invalid_ballot'))
      }
    }
  })

  const handleDoubleClickAdd = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setCandidates((prev) => ({
      selectedCandidates: [...prev.selectedCandidates, candidateId],
      availableCandidates: prev.availableCandidates.filter(
        (c) => c !== candidateId
      )
    }))
  }

  const handleDoubleClickRemove = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setCandidates((prev) => ({
      availableCandidates: [...prev.availableCandidates, candidateId],
      selectedCandidates: prev.selectedCandidates.filter(
        (c) => c !== candidateId
      )
    }))
  }

  const getCandidateName = (candidateId: string) => {
    return election?.candidates.find((c) => c.candidateId === candidateId)?.name
  }

  const getBallotCode = async (ballotId: string | undefined) => {
    if (!ballotId) {
      return
    }
    await navigator.clipboard.writeText(ballotId)
    toast.success(t('audit_copied_to_clipboard'))
  }

  if (!election || election.status !== 'ONGOING') {
    return (
      <TitleWrapper title={t('title')}>
        <div className="text-fk-black flex flex-col items-center rounded-lg text-center">
          <h2 className="mb-3 text-xl font-semibold">
            {t('election_not_ongoing')}
          </h2>
          <p className="text-fk-black">
            {t('election_not_ongoing_description')}
          </p>
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/"
            className="bg-fk-yellow text-fk-black mb-3 rounded-lg px-4 py-3 transition-colors hover:bg-amber-500"
          >
            {t('back_to_frontpage')}
          </Link>
        </div>
      </TitleWrapper>
    )
  }

  return (
    <TitleWrapper title={t('title')}>
      <div className="overflow-hidden rounded-lg border bg-white shadow">
        <div className="bg-gray-50 p-4">
          <h4 className="text-lg">{election.title}</h4>
        </div>
        <div className="p-4">
          <Link
            href="/"
            className="bg-fk-yellow text-fk-black mb-3 inline-block rounded-lg px-4 py-3 transition-colors hover:bg-amber-500"
          >
            {t('back_to_frontpage')}
          </Link>
          <p className="mb-4">{election.description}</p>
          {!!voter.hasVoted || !!result.data?.ballotId ? (
            <div className="rounded-lg bg-green-50 p-4 text-center text-green-700">
              <h4 className="mb-3 text-lg font-semibold">
                {result.data?.ballotId
                  ? t('thanks_for_voting')
                  : t('already_voted')}
              </h4>
              {!!result.data?.ballotId && (
                <>
                  <p>{t('audit_info')}</p>
                  <button
                    type="button"
                    onClick={() => getBallotCode(result.data?.ballotId)}
                    className="bg-fk-yellow text-fk-black mt-3 cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500"
                  >
                    {t('audit_button')}
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="my-3 font-bold">
                {t('to_choose', { seats: election.seats })}
              </div>
              <div className="my-3 font-bold">{t('vote_instruction')}</div>
              <DragDropProvider
                onDragStart={() => setDisableVote(true)}
                onDragOver={(event) =>
                  setCandidates((prev) => move(prev, event))
                }
                onDragEnd={() => setDisableVote(false)}
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <h5 className="mb-2 font-medium">{t('your_ballot')}</h5>
                    <DroppableContainer
                      id="selectedCandidates"
                      className="bg-fk-yellow mb-3 min-h-[200px] rounded-lg border p-2"
                    >
                      <div className="space-y-2">
                        {selectedCandidates.map((candidateId, index) => (
                          <SortableItem
                            key={candidateId}
                            id={candidateId}
                            index={index}
                            name={getCandidateName(candidateId) ?? ''}
                            onDoubleClick={handleDoubleClickRemove}
                            showIndex={true}
                            containerId="selectedCandidates"
                          />
                        ))}
                      </div>
                    </DroppableContainer>
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-2 font-medium">
                      {t('available_candidates')}
                    </h5>
                    <DroppableContainer
                      id="availableCandidates"
                      className="bg-fk-black mb-3 min-h-[200px] rounded-lg border p-2"
                    >
                      <div className="space-y-2">
                        {availableCandidates.map((candidateId, index) => (
                          <SortableItem
                            key={candidateId}
                            id={candidateId}
                            index={index}
                            name={getCandidateName(candidateId) ?? ''}
                            onDoubleClick={handleDoubleClickAdd}
                            containerId="availableCandidates"
                          />
                        ))}
                      </div>
                    </DroppableContainer>
                  </div>
                </div>
              </DragDropProvider>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => setConfirmingVote(true)}
                  disabled={disableVote || isPending}
                  className={`text-fk-black rounded-lg px-4 py-2 ${
                    disableVote
                      ? 'cursor-not-allowed bg-gray-300'
                      : 'bg-fk-yellow cursor-pointer transition-colors hover:bg-amber-500'
                  }`}
                >
                  {t('submit_vote')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {confirmingVote && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0 bg-gray-500/60 transition-opacity"
            onClick={() => setConfirmingVote(false)}
          />
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="animate-in fade-in relative w-full max-w-lg transform rounded-lg border-2 border-white/10 bg-white shadow-[0_0_40px_rgba(0,0,0,0.2)] ring-1 ring-black/5 transition-all duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium" id="modal-title">
                  {t('confirm_vote')}
                </h3>
                <div className="mt-4 text-center">
                  <p>{t('confirm_vote_description')}</p>
                  {selectedCandidates.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {selectedCandidates.map((candidateId, index) => (
                        <div
                          key={candidateId}
                          className="rounded-lg border p-2"
                        >
                          {index + 1}
                          {'. '}
                          {getCandidateName(candidateId)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mx-5 mt-4 rounded-lg bg-red-50 p-4 text-center text-red-700">
                      {t('empty_ballot')}
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() =>
                    execute({
                      voterId: voter.voterId,
                      ballot: selectedCandidates.map((candidateId, index) => ({
                        candidateId,
                        rank: index + 1
                      }))
                    })
                  }
                  disabled={disableVote || isPending}
                  className="bg-fk-yellow text-fk-black mb-2 w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500 sm:mb-0 sm:ml-2 sm:w-auto"
                >
                  {t('confirm')}
                </button>
                <button
                  onClick={() => setConfirmingVote(false)}
                  disabled={disableVote || isPending}
                  className="w-full cursor-pointer rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 sm:w-auto"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TitleWrapper>
  )
}
