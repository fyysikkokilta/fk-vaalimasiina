import React from 'react'
import { Button, Card, Col, Container, ListGroup, Row } from 'react-bootstrap'
import { Election } from '../../../../types/types'
import { VotingResult } from '../../utils/stvAlgorithm'

import styles from './electionResults.module.scss'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

type ElectionResultsProps = {
  election: Election
  votingResult: VotingResult
}

export const ElectionResults = ({
  election,
  votingResult,
}: ElectionResultsProps) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'results',
  })

  const getCandidateName = (candidateId: string) => {
    const candidate = election.candidates.find(
      (c) => c.candidateId === candidateId
    )!
    return candidate.name
  }

  const exportBallotsToCSV = () => {
    const headers = [
      'Lipuke',
      ...Array.from(
        { length: election.candidates.length },
        (_, i) => `Preference ${i + 1}`
      ),
    ]
    const rows = votingResult.ballots.map((ballot, i) => [
      i + 1,
      ballot.map((candidateId) => getCandidateName(candidateId)),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = election.title + '.csv'
    a.click()
  }

  const getMinutesParagraphs = () => {
    const totalVotes = votingResult.totalVotes
    const emptyVotes = votingResult.ballots.filter(
      (ballot) => ballot.length === 0
    ).length
    const candidatesNamesAndIdsSorted = election.candidates
      .map((candidate) => ({
        name: candidate.name,
        id: candidate.candidateId,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const firstParagraph = `Ääniä annettiin ${totalVotes} ${totalVotes > 1 ? 'kappaletta' : 'kappale'}, joista ${emptyVotes} oli ${emptyVotes > 1 ? 'tyhjiä' : 'tyhjä'}. Äänestystulos oli vaalikelpoinen.`
    const firstDecimalVotesRound = votingResult.roundResults.find(
      ({ candidateResults, droppedCandidate }) => {
        return (
          candidateResults.some(({ data }) => data.voteCount % 1 !== 0) ||
          (droppedCandidate && droppedCandidate.voteCount % 1 !== 0)
        )
      }
    )
    const secondParagraph = firstDecimalVotesRound
      ? `Siirtoäänivaalitavasta johtuen päädyttiin desimaaliääniin ${firstDecimalVotesRound.round} kierroksella. Äänet on kirjattu pöytäkirjaan kahden desimaalin tarkkuudella.`
      : null

    const winners: string[] = []

    const roundParagraphs = votingResult.roundResults.map(
      ({ round, candidateResults, droppedCandidate, quota, tieBreaker }) => {
        const voteNameString = `Tulos ${round}. kierroksella (äänikynnys ${quota}): ${candidatesNamesAndIdsSorted
          .map(({ name, id }) => {
            const candidate = candidateResults.find((c) => c.data.id === id)
            return `${name} ${candidate ? Math.round((candidate.data.voteCount + Number.EPSILON) * 100) / 100 : '-'} ${candidate?.isSelected ? '(valittu)' : ''}`
          })
          .join('; ')}.`
        const winnersThisRound = candidateResults.filter(
          ({ data }) =>
            data.voteCount >= quota && winners.indexOf(data.id) === -1
        )
        const winnersNames = winnersThisRound
          .map(({ data }) => getCandidateName(data.id))
          .join(' ja ')
        winners.push(...winnersThisRound.map(({ data }) => data.id))

        const winnersString =
          winnersThisRound.length > 0
            ? `${winnersNames} ${winnersThisRound.length > 1 ? 'ylittivät' : 'ylitti'} äänikynnyksen ja merkittiin täten äänestyksessä ${winnersThisRound.length > 1 ? 'valituiksi' : 'valituksi'}.`
            : null
        const droppedCandidateString = droppedCandidate
          ? `Kukaan ei ylittänyt äänikynnystä ${round}. kierroksella, joten pudotettiin vähiten ääniä saanut ehdokas ${getCandidateName(droppedCandidate.id)} pois. ${tieBreaker ? 'Pudotuksen ratkaisi arpa.' : ''}`
          : null

        const winnersExtraParagraph =
          winnersThisRound.length > 0 &&
          round !== votingResult.roundResults.length
            ? `${round + 1}. kierroksella jaettiin ${winnersNames} äänikynnyksen ylittäneet ${winnersThisRound.map(({ data }) => data.voteCount - quota).join('ja')} ääntä muille ehdokkaille siirtoäänivaalitavan määräämillä kertoimilla painotettuna.`
            : null

        const paragraph = [
          voteNameString,
          winnersString,
          droppedCandidateString,
        ]
          .filter((s) => s)
          .join(' ')

        return [paragraph, winnersExtraParagraph].filter((s) => s).join('\n\n')
      }
    )

    const winnersParagraph = `Äänestystuloksen perusteella päätettiin valita ${votingResult.winners.map((id) => getCandidateName(id)).join('ja')} Fyysikkokillan rooliin X vuodelle YYYY ajassa ZZ.ZZ.`

    navigator.clipboard.writeText(
      [firstParagraph, secondParagraph, ...roundParagraphs, winnersParagraph]
        .filter((s) => s)
        .join('\n\n')
    )
    toast.success(t('minutes_copied_to_clipboard'))
  }

  return (
    <Container className={styles.resultsContainer}>
      <Row className="mb-4">
        <Col className="mb-3 text-center">
          <h3>{election.title}</h3>
          <Row>
            <span className="mt-3">
              {t('voters')}: {votingResult.totalVoters}
            </span>
            <span className="mt-3">
              {t('non_empty_votes')}: {votingResult.totalVotes}
            </span>
          </Row>
          <Button onClick={exportBallotsToCSV} className="mt-3 mx-2">
            {t('export_csv')}
          </Button>
          <Button onClick={getMinutesParagraphs} className="mt-3 mx-2">
            {t('export_minutes')}
          </Button>
        </Col>
      </Row>
      <ListGroup>
        {votingResult.roundResults.map(
          ({
            droppedCandidate,
            candidateResults,
            quota,
            round,
            tieBreaker,
          }) => (
            <ListGroup.Item key={round} className="mb-3 text-center">
              <Card>
                <Card.Header as="h5">
                  {t('round')} {round}
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    {t('remaining_to_choose')}:&nbsp;
                    {election.amountToElect -
                      candidateResults.filter(({ isSelected }) => isSelected)
                        .length}
                    &nbsp; {t('election_threshold')}:&nbsp;{quota}
                  </Card.Title>
                  <ListGroup variant="flush">
                    {candidateResults.map(({ data, isSelected }) => (
                      <ListGroup.Item key={data.id}>
                        {getCandidateName(data.id)} - {data.voteCount}{' '}
                        {t('votes')}
                        {isSelected && (
                          <span className="text-success"> - {t('chosen')}</span>
                        )}
                      </ListGroup.Item>
                    ))}
                    {droppedCandidate && (
                      <ListGroup.Item className="text-danger">
                        {getCandidateName(droppedCandidate.id)} -{' '}
                        {droppedCandidate.voteCount} {t('votes')} -{' '}
                        {t('not_chosen')}
                        {tieBreaker && ` - ${t('tie_breaker')}`}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </ListGroup.Item>
          )
        )}
      </ListGroup>
      <Row>
        <Col className="text-center">
          <h4>{t('chosen_candidates')}</h4>
          <ListGroup>
            {votingResult.winners.map((winnerId) => (
              <ListGroup.Item key={winnerId}>
                {getCandidateName(winnerId)}
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </Container>
  )
}
