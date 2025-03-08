'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import {
  type Ballot,
  calculateSTVResult,
  type Election,
  type ValidVotingResult
} from '~/algorithm/stvAlgorithm'

import ElectionActions from './ElectionActions'

function InitialVotes({
  election,
  votingResult
}: {
  election: Election
  votingResult: ValidVotingResult
}) {
  const t = useTranslations('ElectionResults')
  return (
    <div
      id="initial_votes"
      className="mb-3 overflow-hidden rounded-lg border border-gray-200"
    >
      <h5 className="bg-gray-50 p-4 text-center font-medium">
        {t('initial_votes')}
      </h5>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">
              {t('total_votes')}
            </th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">
              {t('non_empty_votes')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="even:bg-gray-50">
            <td className="p-3">{votingResult.totalVotes}</td>
            <td className="p-3">{votingResult.nonEmptyVotes}</td>
          </tr>
        </tbody>
        <thead className="border-t border-gray-200 bg-gray-50">
          <tr>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">
              {t('seats')}
            </th>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">
              {t('election_threshold')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-gray-50">
            <td className="p-3">{election.seats}</td>
            <td className="p-3">{votingResult.quota}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function RoundResult({
  round,
  candidateResults,
  tieBreaker,
  emptyVotes
}: {
  round: number
  candidateResults: ValidVotingResult['roundResults'][0]['candidateResults']
  tieBreaker?: boolean | undefined
  emptyVotes: number
}) {
  const t = useTranslations('ElectionResults')

  const roundToTwoDecimals = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100

  return (
    <div
      id={`round-${round}`}
      className="mb-3 overflow-hidden rounded-lg border border-gray-200"
    >
      <h5 className="bg-gray-50 p-4 text-center font-medium">
        {t('round')} {round}
      </h5>
      <div>
        <table className="w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('candidate_name')}
              </th>
              <th className="p-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('vote_count')}
              </th>
              <th className="px-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('result')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidateResults.map(
              ({
                id,
                name,
                voteCount,
                isSelected,
                isSelectedThisRound,
                isEliminated,
                isEliminatedThisRound
              }) => (
                <tr key={id} className="even:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900">{name}</td>
                  <td className="p-3 text-sm text-gray-900">
                    {isEliminated && !isEliminatedThisRound ? (
                      '-'
                    ) : (
                      <div className="group relative">
                        <span>{roundToTwoDecimals(voteCount)}</span>
                        {voteCount !== roundToTwoDecimals(voteCount) && (
                          <div className="invisible absolute top-full left-1/2 -translate-x-1/2 rounded px-2 text-xs text-gray-500 group-hover:visible">
                            {voteCount}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-sm">
                    {isSelected && (
                      <span className="text-nowrap text-green-600">
                        {t(isSelectedThisRound ? 'chosen' : 'chosen_before')}
                      </span>
                    )}
                    {isEliminated && (
                      <span className="text-nowrap text-red-600">
                        {t(
                          isEliminatedThisRound
                            ? 'eliminated'
                            : 'eliminated_before'
                        )}
                        {tieBreaker && ` - ${t('tie_breaker')}`}
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
            <tr className="bg-red-50 font-semibold">
              <td className="p-3 text-sm text-gray-900">{t('empty_votes')}</td>
              <td className="p-3 text-sm text-gray-900">
                {roundToTwoDecimals(emptyVotes)}
              </td>
              <td className="p-3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Winners({ winners }: { winners: ValidVotingResult['winners'] }) {
  const t = useTranslations('ElectionResults')
  return (
    <div
      id="chosen_candidates"
      className="mb-3 overflow-hidden rounded-lg border border-gray-200"
    >
      <h5 className="bg-gray-50 p-4 text-center font-medium">
        {t('chosen_candidates')}
      </h5>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-xs font-medium text-gray-500 uppercase">
              {t('candidate_name')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {winners.map(({ id, name }) => (
            <tr key={id} className="even:bg-gray-50">
              <td className="p-3">{name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ElectionResults({
  election,
  ballots,
  voterCount
}: {
  election: Election
  ballots: Ballot[]
  voterCount: number
}) {
  const [currentRound, setCurrentRound] = useState(0)
  const t = useTranslations('ElectionResults')

  const votingResult = calculateSTVResult(election, ballots, voterCount)

  if (!votingResult.validResult) {
    return (
      <div className="container mx-auto mb-4">
        <div className="text-center">
          <h3 className="mb-4 text-2xl font-semibold">{election.title}</h3>
          <div className="mb-4">{election.description}</div>
          <div className="flex flex-col space-y-2">
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
          <div className="mt-4 rounded-lg bg-red-100 p-4 text-red-700">
            {t('invalid_result')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="mb-4 text-center">
        <h3 className="mb-2 text-2xl font-semibold">{election.title}</h3>
        <div className="mb-3">{election.description}</div>
        <ElectionActions election={election} votingResult={votingResult} />
      </div>
      <div className="mb-4 flex justify-between">
        <button
          type="button"
          onClick={() => setCurrentRound((curr) => curr - 1)}
          disabled={currentRound === 0}
          className={`rounded-lg px-4 py-2 ${
            currentRound === 0
              ? 'cursor-not-allowed bg-gray-300'
              : 'cursor-pointer bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {t('previous_round')}
        </button>
        <button
          type="button"
          onClick={() => setCurrentRound((curr) => curr + 1)}
          disabled={currentRound === votingResult.roundResults.length + 1}
          className={`rounded-lg px-4 py-2 ${
            currentRound === votingResult.roundResults.length + 1
              ? 'cursor-not-allowed bg-gray-300'
              : 'cursor-pointer bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {t('next_round')}
        </button>
      </div>
      {currentRound === 0 ? (
        <InitialVotes election={election} votingResult={votingResult} />
      ) : currentRound === votingResult.roundResults.length + 1 ? (
        <Winners winners={votingResult.winners} />
      ) : (
        <RoundResult {...votingResult.roundResults[currentRound - 1]} />
      )}
    </div>
  )
}
