'use client'

import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { MouseEvent, useState } from 'react'
import { z } from 'zod'

import { vote } from '~/actions/vote'
import DroppableContainer from '~/components/DroppableContainer'
import SortableItem from '~/components/SortableItem'
import TitleWrapper from '~/components/TitleWrapper'
import { Button } from '~/components/ui/Button'
import type { VotePageProps } from '~/data/getVoter'
import { Link } from '~/i18n/navigation'

export default function Vote({ election, voter }: VotePageProps) {
  const [confirmingVote, setConfirmingVote] = useState(false)
  const [disableVote, setDisableVote] = useState(false)
  const [ballotCopied, setBallotCopied] = useState(false)
  const [candidates, setCandidates] = useState({
    selectedCandidates: [] as string[],
    availableCandidates: election.candidates.map((c) => c.candidateId)
  })

  const selectedCandidates = candidates.selectedCandidates
  const availableCandidates = candidates.availableCandidates

  const t = useTranslations('Vote')

  const voteSchema = z.object({
    voterId: z.uuid(t('validation.voterId_uuid')),
    ballot: z
      .array(
        z.object({
          candidateId: z.uuid(t('validation.candidateId_uuid')),
          rank: z
            .number(t('validation.rank_number'))
            .min(1, t('validation.rank_min'))
        }),
        t('validation.ballot_array')
      )
      .refine((ballot) => {
        const ranks = ballot.map((v) => v.rank)
        return (
          ranks.length === new Set(ranks).size &&
          ranks.every((rank, index) => rank === index + 1)
        )
      }, t('validation.ranks_unique'))
  })

  const {
    execute,
    status: voteActionStatus,
    result
  } = useAction(vote, {
    onExecute: () => setDisableVote(true),
    onSuccess: () => {
      setConfirmingVote(false)
    },
    onError: () => {
      setDisableVote(false)
    }
  })

  const handleDoubleClickAdd = (event: MouseEvent<HTMLElement>) => {
    const candidateId = event.currentTarget.id
    setCandidates((prev) => ({
      selectedCandidates: [...prev.selectedCandidates, candidateId],
      availableCandidates: prev.availableCandidates.filter(
        (c) => c !== candidateId
      )
    }))
  }

  const handleDoubleClickRemove = (event: MouseEvent<HTMLElement>) => {
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
    setBallotCopied(true)
    setTimeout(() => setBallotCopied(false), 3000)
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
                  <Button
                    type="button"
                    onClick={() => getBallotCode(result.data?.ballotId)}
                    variant="yellow"
                    className="mt-3"
                  >
                    {ballotCopied
                      ? t('audit_copied_to_clipboard')
                      : t('audit_button')}
                  </Button>
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
                <Button
                  variant="yellow"
                  disabled={disableVote}
                  actionStatus={voteActionStatus}
                  onClick={() => setConfirmingVote(true)}
                >
                  {t('submit_vote')}
                </Button>
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
                <Button
                  variant="yellow"
                  className="mb-2 w-full sm:mb-0 sm:ml-2 sm:w-auto"
                  disabled={disableVote}
                  actionStatus={voteActionStatus}
                  onClick={() => {
                    const payload = {
                      voterId: voter.voterId,
                      ballot: selectedCandidates.map((candidateId, index) => ({
                        candidateId,
                        rank: index + 1
                      }))
                    }
                    const parsed = voteSchema.safeParse(payload)
                    if (!parsed.success) {
                      return
                    }
                    execute(parsed.data)
                  }}
                >
                  {t('confirm')}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={disableVote}
                  actionStatus={voteActionStatus}
                  onClick={() => setConfirmingVote(false)}
                >
                  {t('cancel')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </TitleWrapper>
  )
}
