'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import {
  type Ballot,
  calculateSTVResult,
  type Election,
  type ValidVotingResult
} from '~/algorithm/stvAlgorithm'
import { roundToTwoDecimals } from '~/utils/roundToTwoDecimals'

import ElectionActions from './ElectionActions'
import { Button } from './ui/Button'

function ResultsTable({
  election,
  votingResult,
  numCandidates,
  stepsPerRound,
  step
}: {
  election: Election
  votingResult: ValidVotingResult
  numCandidates: number
  stepsPerRound: number
  step?: number
}) {
  const t = useTranslations('ElectionResults')
  const showAllImmediately = step === undefined

  // All candidate rows are always shown
  const allCandidates = votingResult.roundResults[0].candidateResults

  // Determine which rounds (columns) to show
  const visibleRoundCount = showAllImmediately
    ? votingResult.roundResults.length
    : Math.floor(step / stepsPerRound) + 1

  const visibleRounds = votingResult.roundResults.slice(0, visibleRoundCount)

  // Helper to check if a cell should be visible
  const isCellVisible = (roundIdx: number, candidateIdx: number): boolean => {
    if (showAllImmediately) return true
    const cellStep = roundIdx * stepsPerRound + 1 + candidateIdx
    return step! >= cellStep
  }

  // Helper to check if empty votes should be visible for a round
  const isEmptyVotesVisible = (roundIdx: number): boolean => {
    if (showAllImmediately) return true
    const emptyStep = roundIdx * stepsPerRound + numCandidates + 1
    return step! >= emptyStep
  }

  // Helper to check if results should be visible for a round
  const isResultsVisible = (roundIdx: number): boolean => {
    if (showAllImmediately) return true
    const resultsStep = roundIdx * stepsPerRound + numCandidates + 2
    return step! >= resultsStep
  }

  // Find election/elimination round for each candidate
  const getCandidateStatus = (candidateId: string) => {
    let electionRound: number | undefined
    let eliminationRound: number | undefined

    for (const roundResult of votingResult.roundResults) {
      const candidate = roundResult.candidateResults.find((c) => c.id === candidateId)
      if (candidate?.isSelectedThisRound) {
        electionRound = roundResult.round
      }
      if (candidate?.isEliminatedThisRound) {
        eliminationRound = roundResult.round
      }
    }

    return { electionRound, eliminationRound }
  }

  return (
    <div
      id={showAllImmediately ? 'results_by_candidate' : 'results_by_candidate_paged'}
      className="mb-3 min-w-0 overflow-hidden rounded-lg border border-gray-200"
    >
      <section
        className="border-b border-gray-200 bg-blue-50 px-4 py-3"
        aria-label={t('initial_votes')}
      >
        <h3 className="mb-3 text-center text-xs font-medium tracking-wide text-gray-700 uppercase">
          {t('initial_votes')}
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4 sm:gap-y-0">
          {[
            { key: 'total_votes' as const, value: votingResult.totalVotes },
            {
              key: 'non_empty_votes' as const,
              value: votingResult.nonEmptyVotes
            },
            { key: 'seats' as const, value: election.seats },
            {
              key: 'quota' as const,
              value: votingResult.quota
            }
          ].map(({ key, value }) => (
            <div key={key}>
              <div className="text-xs font-medium text-gray-500 uppercase">{t(key)}</div>
              <div className="text-sm font-medium text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="min-w-0 overflow-x-auto overflow-y-hidden max-md:overflow-x-scroll max-md:[-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[600px] table-auto border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 min-w-[140px] border-r border-gray-200 bg-gray-50 p-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('candidate_name')}
              </th>
              {visibleRounds.map((round) => (
                <th
                  key={round.round}
                  className="p-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
                >
                  {t('round')} {round.round}
                </th>
              ))}
              <th className="min-w-[120px] p-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('result')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {allCandidates.map((candidate, candidateIdx) => {
              const { electionRound, eliminationRound } = getCandidateStatus(candidate.id)

              const showElected = electionRound && isResultsVisible(electionRound - 1)
              const showEliminated = eliminationRound && isResultsVisible(eliminationRound - 1)

              const bgClass = showElected
                ? 'bg-green-50'
                : candidateIdx % 2 === 0
                  ? 'bg-gray-50'
                  : 'bg-white'

              return (
                <tr key={candidate.id} className={bgClass}>
                  <td
                    className={`sticky left-0 z-10 border-r border-gray-200 p-3 text-sm ${bgClass} ${
                      showElected ? 'font-semibold text-green-700' : 'font-medium text-gray-900'
                    }`}
                  >
                    {candidate.name}
                  </td>
                  {visibleRounds.map((round, roundIdx) => {
                    const cellVisible = isCellVisible(roundIdx, candidateIdx)
                    const roundCandidate = round.candidateResults.find((c) => c.id === candidate.id)
                    const voteCount = roundCandidate?.voteCount ?? null
                    const isEliminatedAfterThisRound =
                      eliminationRound && round.round > eliminationRound
                    const meetsQuota = voteCount != null && voteCount >= votingResult.quota

                    return (
                      <td
                        key={round.round}
                        className={`p-3 text-center text-sm text-gray-900 ${bgClass}`}
                      >
                        {cellVisible && voteCount != null ? (
                          isEliminatedAfterThisRound ? (
                            '-'
                          ) : (
                            <span className={meetsQuota ? 'font-semibold' : ''}>
                              {roundToTwoDecimals(voteCount)}
                            </span>
                          )
                        ) : (
                          ''
                        )}
                      </td>
                    )
                  })}
                  <td className={`p-3 text-left text-sm ${bgClass}`}>
                    {showElected && <span className="text-green-600">{t('chosen_before')}</span>}
                    {showEliminated && (
                      <span className="text-red-600">{t('eliminated_before')}</span>
                    )}
                  </td>
                </tr>
              )
            })}
            <tr key="empty" className="bg-red-50">
              <td className="sticky left-0 z-10 border-r border-gray-200 bg-red-50 p-3 text-sm text-gray-900">
                {t('empty_votes')}
              </td>
              {visibleRounds.map((round, roundIdx) => {
                const visible = isEmptyVotesVisible(roundIdx)
                return (
                  <td key={round.round} className="bg-red-50 p-3 text-center text-sm text-gray-900">
                    {visible ? roundToTwoDecimals(round.emptyVotes) : ''}
                  </td>
                )
              })}
              <td className="bg-red-50 p-3 text-left" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ElectionResults({
  election,
  ballots,
  voterCount,
  showAllImmediately
}: {
  election: Election
  ballots: Ballot[]
  voterCount: number
  showAllImmediately: boolean
}) {
  const [step, setStep] = useState(0)
  const t = useTranslations('ElectionResults')
  const votingResult = calculateSTVResult(election, ballots, voterCount)

  if (!votingResult.validResult) {
    return (
      <div className="mx-auto mb-4 text-center">
        <h3 className="mb-4 text-2xl font-semibold">{election.title}</h3>
        <div className="mb-2">{election.date.toLocaleDateString('fi-FI')}</div>
        <div className="mb-4">{election.description}</div>
        <div className="mb-4 flex flex-col space-y-2">
          <span>
            {t('total_votes')}
            {': '}
            {votingResult.totalVotes}
          </span>
          <span>
            {t('voter_count')}
            {': '}
            {votingResult.voterCount}
          </span>
        </div>
        <div className="rounded-lg bg-red-100 p-4 text-red-700">{t('invalid_result')}</div>
      </div>
    )
  }

  const numCandidates = votingResult.roundResults[0].candidateResults.length
  const stepsPerRound = numCandidates + 3 // 1 (round start) + N (candidates) + 1 (empty votes) + 1 (results)
  const totalSteps = votingResult.roundResults.length * stepsPerRound

  const header = (
    <div className="mb-4 text-center">
      <h3 className="mb-2 text-2xl font-semibold">{election.title}</h3>
      <div className="mb-2">{election.date.toLocaleDateString('fi-FI')}</div>
      <div className="mb-3">{election.description}</div>
      <ElectionActions election={election} votingResult={votingResult} />
    </div>
  )

  if (showAllImmediately) {
    return (
      <div>
        {header}
        <ResultsTable
          election={election}
          votingResult={votingResult}
          numCandidates={numCandidates}
          stepsPerRound={stepsPerRound}
        />
      </div>
    )
  }

  const isFirstStep = step === 0
  const isLastStep = step === totalSteps - 1

  return (
    <div>
      {header}
      <div className="mb-4 flex justify-between">
        <Button
          variant="secondary"
          disabled={isFirstStep}
          onClick={() => setStep((p) => Math.max(0, p - 1))}
        >
          {t('previous_round')}
        </Button>
        <Button
          variant="secondary"
          disabled={isLastStep}
          onClick={() => setStep((p) => Math.min(totalSteps - 1, p + 1))}
        >
          {t('next_round')}
        </Button>
      </div>
      <ResultsTable
        election={election}
        votingResult={votingResult}
        numCandidates={numCandidates}
        stepsPerRound={stepsPerRound}
        step={step}
      />
    </div>
  )
}
