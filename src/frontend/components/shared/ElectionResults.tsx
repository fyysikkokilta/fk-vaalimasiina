import React from 'react'
import { Button, Card, Col, Container, ListGroup, Row } from 'react-bootstrap'
import { Election } from '../../../../types/types'
import { VotingResult } from '../../utils/stvAlgorithm'

import styles from './electionResults.module.scss'
import { useTranslation } from 'react-i18next'

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
          <Button onClick={exportBallotsToCSV} className="mt-3">
            {t('export_csv')}
          </Button>
        </Col>
      </Row>
      <ListGroup>
        {votingResult.roundResults.map(
          ({ droppedCandidate, candidateResults, quota, round, tieBreaker }) => (
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
                        {getCandidateName(droppedCandidate.id)} - {droppedCandidate.voteCount}{' '}
                        {t('votes')} - {' '}
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
