'use client'

import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from '@hello-pangea/dnd'
import { notFound } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import TitleWrapper from '~/components/TitleWrapper'
import { Link, useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

export default function Vote({ voterId }: { voterId: string }) {
  const [voterElection] = trpc.voters.getWithId.useSuspenseQuery({
    voterId
  })
  const post = trpc.votes.post.useMutation()
  const utils = trpc.useUtils()
  const [confirmingVote, setConfirmingVote] = useState(false)
  const [disableVote, setDisableVote] = useState(false)
  const [ballotId, setBallotId] = useState('')
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([])
  const [availableCandidates, setAvailableCandidates] = useState<string[]>(
    voterElection?.election?.candidates.map((c) => c.candidateId) || []
  )
  const t = useTranslations('voter.vote')
  const router = useRouter()

  if (!voterElection) {
    notFound()
  }

  const { election, voter } = voterElection

  const handleDragStart = () => {
    setDisableVote(true)
  }

  const handleDragEnd = (result: DropResult<string>) => {
    if (!result.destination) {
      return
    }
    const destinationIndex = result.destination.index

    const candidateId = result.draggableId

    if (
      result.source.droppableId === 'availableCandidates' &&
      result.destination.droppableId === 'selectedCandidates'
    ) {
      const candidate = availableCandidates.find(
        (candidate) => candidate === candidateId
      )
      if (candidate) {
        setSelectedCandidates((prev) => {
          const newCandidates = [...prev]
          newCandidates.splice(destinationIndex, 0, candidate)
          return newCandidates
        })
        setAvailableCandidates((prev) => prev.filter((c) => c !== candidateId))
      }
    }

    if (
      result.source.droppableId === 'selectedCandidates' &&
      result.destination.droppableId === 'selectedCandidates'
    ) {
      setSelectedCandidates((prev) => {
        const newCandidates = [...prev]
        const [removed] = newCandidates.splice(result.source.index, 1)
        newCandidates.splice(destinationIndex, 0, removed)
        return newCandidates
      })
    }

    if (
      result.source.droppableId === 'selectedCandidates' &&
      result.destination.droppableId === 'availableCandidates'
    ) {
      setAvailableCandidates((prev) => {
        const newCandidates = [...prev]
        newCandidates.splice(destinationIndex, 0, candidateId)
        return newCandidates
      })
      setSelectedCandidates((prev) => prev.filter((c) => c !== candidateId))
    }

    if (
      result.source.droppableId === 'availableCandidates' &&
      result.destination.droppableId === 'availableCandidates'
    ) {
      const [removed] = availableCandidates.splice(result.source.index, 1)
      availableCandidates.splice(destinationIndex, 0, removed)
    }
    setDisableVote(false)
  }

  const handleDoubleClickAdd = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setSelectedCandidates((prev) => [...prev, candidateId])
    setAvailableCandidates((prev) => prev.filter((c) => c !== candidateId))
  }

  const handleDoubleClickRemove = (event: React.MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setAvailableCandidates((prev) => [...prev, candidateId])
    setSelectedCandidates((prev) => prev.filter((c) => c !== candidateId))
  }

  const handleVote = () => {
    if (!voterId) {
      return
    }
    setDisableVote(true)
    post.mutate(
      {
        voterId,
        ballot: selectedCandidates.map((candidateId, i) => ({
          candidateId,
          rank: i + 1
        }))
      },
      {
        onSuccess: ({ ballotId }) => {
          void utils.voters.getWithId.invalidate({ voterId })
          setConfirmingVote(false)
          setBallotId(ballotId)
        },
        onError: (error) => {
          void utils.voters.getWithId.invalidate({ voterId })
          setDisableVote(false)
          const code = error.data?.code
          if (code === 'NOT_FOUND') {
            router.replace('/')
          }
        }
      }
    )
  }

  const handleVoteConfirmation = () => {
    setConfirmingVote(true)
  }

  const handleVoteCancel = () => {
    setConfirmingVote(false)
  }

  const getCandidateName = (candidateId: string) => {
    return election?.candidates.find((c) => c.candidateId === candidateId)?.name
  }

  const getBallotCode = async () => {
    if (!ballotId) {
      return
    }
    await navigator.clipboard.writeText(ballotId)
    toast.success(t('audit_copied_to_clipboard'))
  }

  if (!election || election.status !== 'ONGOING') {
    return (
      <TitleWrapper title={t('title')}>
        <div className="bg-fk-yellow text-fk-black flex flex-col items-center rounded-lg text-center">
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
          {voter.hasVoted ? (
            <div className="rounded-lg bg-green-50 p-4 text-center text-green-700">
              <h4 className="mb-3 text-lg font-semibold">
                {ballotId ? t('thanks_for_voting') : t('already_voted')}
              </h4>
              {ballotId && (
                <>
                  <p>{t('audit_info')}</p>
                  <button
                    onClick={getBallotCode}
                    className="bg-fk-yellow text-fk-black mt-3 cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500"
                  >
                    {t('audit_button')}
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="my-3 font-bold">{t('vote_instruction')}</div>
              <DragDropContext
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="flex-1">
                    <h5 className="mb-2 font-medium">{t('your_ballot')}</h5>
                    <Droppable droppableId="selectedCandidates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-fk-yellow mb-3 min-h-[200px] rounded-lg border p-2"
                          id="selected-candidates"
                        >
                          <div className="space-y-2">
                            {selectedCandidates.map((candidateId, index) => (
                              <Draggable
                                key={candidateId}
                                draggableId={candidateId}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    id={candidateId}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center rounded-lg bg-white p-2 shadow-sm"
                                    onDoubleClick={handleDoubleClickRemove}
                                  >
                                    {index + 1}
                                    {'. '}
                                    {getCandidateName(candidateId)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                  <div className="flex-1">
                    <h5 className="mb-2 font-medium">
                      {t('available_candidates')}
                    </h5>
                    <Droppable droppableId="availableCandidates">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="bg-fk-black mb-3 min-h-[200px] rounded-lg border p-2"
                          id="available-candidates"
                        >
                          <div className="space-y-2">
                            {availableCandidates.map((candidateId, index) => (
                              <Draggable
                                key={candidateId}
                                draggableId={candidateId}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    id={candidateId}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="flex items-center rounded-lg bg-white p-2 shadow-sm"
                                    onDoubleClick={handleDoubleClickAdd}
                                  >
                                    {getCandidateName(candidateId)}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              </DragDropContext>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleVoteConfirmation}
                  disabled={disableVote}
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
            onClick={handleVoteCancel}
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
                  onClick={handleVote}
                  disabled={disableVote}
                  className="bg-fk-yellow text-fk-black mb-2 w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500 sm:mb-0 sm:ml-2 sm:w-auto"
                >
                  {t('confirm')}
                </button>
                <button
                  onClick={handleVoteCancel}
                  disabled={disableVote}
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
