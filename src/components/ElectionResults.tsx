'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import type {
  Election,
  ValidVotingResult,
  VotingResult
} from '~/algorithm/stvAlgorithm'

import ElectionActions from './ElectionActions'

function InitialVotes({
  election,
  votingResult
}: {
  election: Election
  votingResult: ValidVotingResult
}) {
  const t = useTranslations('results')
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
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
              {t('total_votes')}
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
              {t('non_empty_votes')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr className="even:bg-gray-50">
            <td className="px-4 py-4">{votingResult.totalVotes}</td>
            <td className="px-4 py-4">{votingResult.nonEmptyVotes}</td>
          </tr>
        </tbody>
        <thead className="border-t border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
              {t('seats')}
            </th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
              {t('election_threshold')}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="even:bg-gray-50">
            <td className="px-4 py-4">{election.seats}</td>
            <td className="px-4 py-4">{votingResult.quota}</td>
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
  const t = useTranslations('results')

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
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('candidate_name')}
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('vote_count')}
              </th>
              <th className="px-4 py-3 text-xs font-medium tracking-wider text-gray-500 uppercase">
                {t('result')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidateResults.map(
              ({ id, name, voteCount, isSelected, isEliminated }) => (
                <tr key={id} className="even:bg-gray-50">
                  <td className="px-4 py-4 text-sm text-gray-900">{name}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {roundToTwoDecimals(voteCount)}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {isSelected && (
                      <span className="text-green-600">{t('chosen')}</span>
                    )}
                    {isEliminated && (
                      <span className="text-red-600">
                        {t('eliminated')}
                        {tieBreaker && ` - ${t('tie_breaker')}`}
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
            <tr className="bg-red-50 font-semibold">
              <td className="px-4 py-4 text-sm text-gray-900">
                {t('empty_votes')}
              </td>
              <td className="px-4 py-4 text-sm text-gray-900">
                {roundToTwoDecimals(emptyVotes)}
              </td>
              <td className="px-4 py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Winners({ winners }: { winners: ValidVotingResult['winners'] }) {
  const t = useTranslations('results')
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
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">
              {t('candidate_name')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {winners.map(({ id, name }) => (
            <tr key={id} className="even:bg-gray-50">
              <td className="px-4 py-4">{name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ElectionResults({
  election,
  votingResult
}: {
  election: Election
  votingResult: VotingResult
}) {
  const [currentRound, setCurrentRound] = useState(0)
  const t = useTranslations('results')

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
