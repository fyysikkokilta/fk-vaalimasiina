'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { downloadElectionCsv } from '~/actions/downloadElectionCsv'
import type { Election, ValidMajorityResult, ValidVotingResult } from '~/algorithm/types'
import { generateCsvContent } from '~/utils/csvGenerator'
import { roundToTwoDecimals } from '~/utils/roundToTwoDecimals'

import { Button } from './ui/Button'

export default function ElectionActions({
  election,
  votingResult,
  votingMethod
}: {
  election: Election
  votingResult: ValidVotingResult | ValidMajorityResult
  votingMethod: 'STV' | 'MAJORITY'
}) {
  const [minutesCopied, setMinutesCopied] = useState(false)
  const t = useTranslations('ElectionResults')
  const ballots = votingResult.ballots

  const handleCsvDownload = async () => {
    let csvData = null
    try {
      const result = await downloadElectionCsv({
        electionId: election.electionId
      })
      if (result?.data?.electionCsvData) {
        csvData = result.data.electionCsvData
      }
    } catch (error) {
      console.error('Error downloading CSV:', error)
    }

    // If the CSV data is not found, generate it client-side
    if (!csvData) {
      csvData = generateCsvContent(ballots, { ...election, votingMethod })
    }

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = election.title + '.csv'
    a.click()
  }

  const getMinutesParagraphsMajority = async (votingResult: ValidMajorityResult) => {
    const totalVotes = votingResult.totalVotes
    const emptyVotes = votingResult.totalVotes - votingResult.nonEmptyVotes
    const firstParagraph = `Ääniä annettiin ${totalVotes} ${totalVotes !== 1 ? 'kappaletta' : 'kappale'}, joista ${emptyVotes} oli ${emptyVotes !== 1 ? 'tyhjiä' : 'tyhjä'}. Äänestystulos oli vaalikelpoinen.`
    const resultsString = votingResult.candidateResults
      .map((c) => `${c.name} ${c.voteCount} ääntä`)
      .join('; ')
    const winnersParagraph =
      votingResult.winners.length > 0
        ? `Valituiksi tulivat: ${votingResult.winners.map(({ name }) => name).join(' ja ')}.`
        : 'Yhtään ehdokasta ei valittu (kaikki äänestivät tyhjää).'
    await navigator.clipboard.writeText(
      [firstParagraph, `Tulokset: ${resultsString}`, winnersParagraph].join('\n\n')
    )
    setMinutesCopied(true)
    setTimeout(() => setMinutesCopied(false), 3000)
  }

  const getMinutesParagraphsSTV = async (votingResult: ValidVotingResult) => {
    const totalVotes = votingResult.totalVotes
    const emptyVotes = votingResult.totalVotes - votingResult.nonEmptyVotes

    const firstParagraph = `Ääniä annettiin ${totalVotes} ${totalVotes !== 1 ? 'kappaletta' : 'kappale'}, joista ${emptyVotes} oli ${emptyVotes !== 1 ? 'tyhjiä' : 'tyhjä'}. Äänestystulos oli vaalikelpoinen.`
    const firstDecimalVotesRound = votingResult.roundResults.find(({ candidateResults }) => {
      return candidateResults.some(({ voteCount }) => voteCount % 1 !== 0)
    })
    const secondParagraph = firstDecimalVotesRound
      ? `Siirtoäänivaalitavasta johtuen päädyttiin desimaaliääniin ${firstDecimalVotesRound.round} kierroksella. Äänet on kirjattu pöytäkirjaan kahden desimaalin tarkkuudella.`
      : null

    const roundParagraphs = votingResult.roundResults.map(
      ({ round, candidateResults, tieBreaker, emptyVotes }) => {
        const quota = votingResult.quota
        const voteNameString = `Tulos ${round}. kierroksella (äänikynnys ${quota}): ${candidateResults
          .map(
            ({ name, voteCount, isSelected, isEliminated, isEliminatedThisRound }) =>
              `${name} ${!isEliminated || isEliminatedThisRound ? roundToTwoDecimals(voteCount) : '-'}${isSelected ? ' (valittu)' : ''}`
          )
          .join('; ')}; tyhjiä ${roundToTwoDecimals(emptyVotes)}.`

        const winnersThisRound = candidateResults.filter((c) => c.isSelectedThisRound)
        const winnersNames = winnersThisRound.map(({ name }) => name).join(' ja ')

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
          winnersThisRound.length > 0 && round < votingResult.roundResults.length
            ? `${round + 1}. kierroksella jaettiin ${winnersNames}n äänikynnyksen ylittäneet ${winnersThisRound.map(({ voteCount }) => roundToTwoDecimals(voteCount - quota)).join(' ja ')} ääntä muille ehdokkaille siirtoäänivaalitavan määräämillä kertoimilla painotettuna.`
            : null

        const paragraph = [voteNameString, winnersString, droppedCandidateString]
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
    setMinutesCopied(true)
    setTimeout(() => setMinutesCopied(false), 3000)
  }

  const handleCopyMinutes = () => {
    if (votingMethod === 'MAJORITY') {
      void getMinutesParagraphsMajority(votingResult as ValidMajorityResult)
    } else {
      void getMinutesParagraphsSTV(votingResult as ValidVotingResult)
    }
  }

  return (
    <div className="flex flex-col justify-center gap-4 md:flex-row">
      <Button onClick={handleCsvDownload} variant="secondary">
        {t('export_csv')}
      </Button>
      <Button onClick={handleCopyMinutes} variant="secondary">
        {minutesCopied ? t('minutes_copied_to_clipboard') : t('export_minutes')}
      </Button>
    </div>
  )
}
