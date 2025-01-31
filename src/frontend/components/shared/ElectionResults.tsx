import React, { useState } from 'react'
import { Alert, Button, Card, Col, Row, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import {
  Ballot,
  Election,
  ValidVotingResult,
  VotingResult
} from '../../algorithm/stvAlgorithm'

type ElectionResultsProps = {
  election: Election
  votingResult: VotingResult
}

const RoundResult = ({
  round,
  candidateResults,
  tieBreaker,
  emptyVotes
}: {
  round: number
  candidateResults: ValidVotingResult['roundResults'][0]['candidateResults']
  tieBreaker?: boolean | undefined
  emptyVotes: number
}) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'results'
  })

  const roundToTwoDecimals = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100

  return (
    <Card id={`round-${round}`} key={round} className="mb-3 text-center">
      <Card.Header as="h5">
        {t('round')} {round}
      </Card.Header>
      <Card.Body className="p-0">
        <Table striped bordered hover className="mb-0">
          <thead>
            <tr>
              <th>{t('candidate_name')}</th>
              <th>{t('vote_count')}</th>
              <th>{t('result')}</th>
            </tr>
          </thead>
          <tbody>
            {candidateResults.map(
              ({ id, name, voteCount, isSelected, isEliminated }) => (
                <tr key={id}>
                  <td>{name}</td>
                  <td>{roundToTwoDecimals(voteCount)}</td>
                  <td>
                    {isSelected && (
                      <span className="text-success">{t('chosen')}</span>
                    )}
                    {isEliminated && (
                      <span className="text-danger">
                        {t('eliminated')}
                        {tieBreaker && ` - ${t('tie_breaker')}`}
                      </span>
                    )}
                  </td>
                </tr>
              )
            )}
            <tr style={{ backgroundColor: '#f8d7da', fontWeight: 'bold' }}>
              <td>{t('empty_votes')}</td>
              <td>{roundToTwoDecimals(emptyVotes)}</td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export const ElectionResults = ({
  election,
  votingResult
}: ElectionResultsProps) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'results'
  })

  const [currentRound, setCurrentRound] = useState(0)

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
    const sortedCandidates = election.candidates.sort((a, b) =>
      a.name.localeCompare(b.name)
    )

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
        const voteNameString = `Tulos ${round}. kierroksella (äänikynnys ${quota}): ${sortedCandidates
          .map(({ name, candidateId }) => {
            const candidate = candidateResults.find((c) => c.id === candidateId)
            return `${name} ${candidate ? roundToTwoDecimals(candidate.voteCount) : '-'}${candidate?.isSelected ? ' (valittu)' : ''}`
          })
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

        const droppedCandidate = candidateResults.find(
          ({ isEliminated }) => isEliminated
        )
        const droppedCandidateString = droppedCandidate
          ? `Kukaan ei ylittänyt äänikynnystä ${round}. kierroksella, joten pudotettiin vähiten ääniä saanut ehdokas ${droppedCandidate.name} pois. ${tieBreaker ? 'Pudotuksen ratkaisi arpa.' : ''}`
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

  if (!votingResult.validResult) {
    return (
      <>
        <Row className="mb-4">
          <Col className="mb-3 text-center">
            <h3>{election.title}</h3>
            <Row>
              <div>{election.description}</div>
              <span className="mt-3">
                {t('total_votes')}: {votingResult.totalVotes}
              </span>
              <span className="mt-3">
                {t('voter_count')}: {votingResult.voterCount}
              </span>
            </Row>
            <Alert variant="danger" className="mt-3 mx-4">
              {t('invalid_result')}
            </Alert>
          </Col>
        </Row>
      </>
    )
  }

  return (
    <>
      <Row className="mb-4">
        <Col className="mb-3 text-center">
          <h3>{election.title}</h3>
          <div>{election.description}</div>
          <Button
            onClick={() => exportBallotsToCSV(votingResult.ballots, election)}
            className="mt-3 mx-2"
          >
            {t('export_csv')}
          </Button>
          <Button
            onClick={() => getMinutesParagraphs(votingResult)}
            className="mt-3 mx-2"
          >
            {t('export_minutes')}
          </Button>
        </Col>
      </Row>
      <Row className="mb-2 px-2">
        <Col className="text-center">
          <Button
            onClick={() => setCurrentRound((curr) => curr - 1)}
            className="float-start"
            disabled={currentRound === 0}
            variant="secondary"
          >
            {t('previous_round')}
          </Button>
          <Button
            onClick={() => setCurrentRound((curr) => curr + 1)}
            className="float-end"
            disabled={currentRound === votingResult.roundResults.length + 1}
            variant="secondary"
          >
            {t('next_round')}
          </Button>
        </Col>
      </Row>
      {currentRound === 0 ? (
        <Card id="initial_votes" className="mb-3 text-center">
          <Card.Header as="h5">{t('initial_votes')}</Card.Header>
          <Card.Body className="p-0">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>{t('total_votes')}</th>
                  <th>{t('non_empty_votes')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{votingResult.totalVotes}</td>
                  <td>{votingResult.nonEmptyVotes}</td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th>{t('seats')}</th>
                  <th>{t('election_threshold')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{election.seats}</td>
                  <td>{votingResult.quota}</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : currentRound === votingResult.roundResults.length + 1 ? (
        <Card id="chosen_candidates" className="mb-3 text-center">
          <Card.Header as="h5">{t('chosen_candidates')}</Card.Header>
          <Card.Body className="p-0">
            <Table striped bordered hover className="mb-0">
              <thead>
                <tr>
                  <th>{t('candidate_name')}</th>
                </tr>
              </thead>
              <tbody>
                {votingResult.winners.map(({ id, name }) => (
                  <tr key={id}>
                    <td>{name}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ) : (
        <RoundResult {...votingResult.roundResults[currentRound - 1]} />
      )}
    </>
  )
}
