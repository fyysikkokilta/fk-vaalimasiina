'use client'

import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'react-toastify'

import type {
  Ballot,
  Election,
  ValidVotingResult
} from '~/algorithm/stvAlgorithm'

export default function ElectionActions({
  election,
  votingResult
}: {
  election: Election
  votingResult: ValidVotingResult
}) {
  const t = useTranslations('results')
  const roundToTwoDecimals = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100

  const exportBallotsToCSV = (ballots: Ballot[], election: Election) => {
    const headers = Array.from(
      { length: election.candidates.length },
      (_, i) => `Preference ${i + 1}`
    )

    const rows = ballots.map((ballot) =>
      ballot.votes.map(
        ({ candidateId }) =>
          election.candidates.find((c) => c.candidateId === candidateId)!.name
      )
    )

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = election.title + '.csv'
    a.click()
  }

  const getMinutesParagraphs = async (votingResult: ValidVotingResult) => {
    const totalVotes = votingResult.totalVotes
    const emptyVotes = votingResult.totalVotes - votingResult.nonEmptyVotes

    const firstParagraph = `Ääniä annettiin ${totalVotes} ${totalVotes !== 1 ? 'kappaletta' : 'kappale'}, joista ${emptyVotes} oli ${emptyVotes !== 1 ? 'tyhjiä' : 'tyhjä'}. Äänestystulos oli vaalikelpoinen.`
    const firstDecimalVotesRound = votingResult.roundResults.find(
      ({ candidateResults }) => {
        return candidateResults.some(({ voteCount }) => voteCount % 1 !== 0)
      }
    )
    const secondParagraph = firstDecimalVotesRound
      ? `Siirtoäänivaalitavasta johtuen päädyttiin desimaaliääniin ${firstDecimalVotesRound.round} kierroksella. Äänet on kirjattu pöytäkirjaan kahden desimaalin tarkkuudella.`
      : null

    const roundParagraphs = votingResult.roundResults.map(
      ({ round, candidateResults, tieBreaker, emptyVotes }) => {
        const quota = votingResult.quota
        const voteNameString = `Tulos ${round}. kierroksella (äänikynnys ${quota}): ${candidateResults
          .map(
            ({
              name,
              voteCount,
              isSelected,
              isEliminated,
              isEliminatedThisRound
            }) =>
              `${name} ${!isEliminated || isEliminatedThisRound ? roundToTwoDecimals(voteCount) : '-'}${isSelected ? ' (valittu)' : ''}`
          )
          .join('; ')}; tyhjiä ${roundToTwoDecimals(emptyVotes)}.`

        const winnersThisRound = candidateResults.filter(
          (c) => c.isSelectedThisRound
        )
        const winnersNames = winnersThisRound
          .map(({ name }) => name)
          .join(' ja ')

        const winnersString =
          winnersThisRound.length > 0
            ? `${winnersNames} ${winnersThisRound.length > 1 ? 'ylittivät' : 'ylitti'} äänikynnyksen ja merkittiin täten äänestyksessä ${winnersThisRound.length > 1 ? 'valituiksi' : 'valituksi'}.`
            : null

        const eliminatedThisRound = candidateResults.find(
          ({ isEliminatedThisRound }) => isEliminatedThisRound
        )
        const droppedCandidateString = eliminatedThisRound
          ? `Kukaan ei ylittänyt äänikynnystä ${round}. kierroksella, joten pudotettiin vähiten ääniä saanut ehdokas ${eliminatedThisRound.name} pois. ${tieBreaker ? 'Pudotuksen ratkaisi arpa.' : ''}`
          : null

        const winnersExtraParagraph =
          winnersThisRound.length > 0 &&
          round < votingResult.roundResults.length
            ? `${round + 1}. kierroksella jaettiin ${winnersNames}n äänikynnyksen ylittäneet ${winnersThisRound.map(({ voteCount }) => roundToTwoDecimals(voteCount - quota)).join(' ja ')} ääntä muille ehdokkaille siirtoäänivaalitavan määräämillä kertoimilla painotettuna.`
            : null

        const paragraph = [
          voteNameString,
          winnersString,
          droppedCandidateString
        ]
          .filter((s) => s)
          .join(' ')

        return [paragraph, winnersExtraParagraph].filter((s) => s).join('\n\n')
      }
    )

    const winnersParagraph = `Äänestystuloksen perusteella päätettiin valita ${votingResult.winners.map(({ name }) => name).join(' ja ')} Fyysikkokillan rooliin X vuodelle YYYY ajassa ZZ.ZZ.`

    await navigator.clipboard.writeText(
      [firstParagraph, secondParagraph, ...roundParagraphs, winnersParagraph]
        .filter((s) => s)
        .join('\n\n')
    )
    toast.success(t('minutes_copied_to_clipboard'))
  }

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row">
      <button
        onClick={() => exportBallotsToCSV(votingResult.ballots, election)}
        className="bg-fk-black cursor-pointer rounded-lg px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-900"
      >
        {t('export_csv')}
      </button>
      <button
        onClick={() => getMinutesParagraphs(votingResult)}
        className="bg-fk-black cursor-pointer rounded-lg px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-900"
      >
        {t('export_minutes')}
      </button>
    </div>
  )
}
