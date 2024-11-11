import React, { useState, useEffect } from 'react'
import { Table, Alert, Card } from 'react-bootstrap'
import { Ballot, Election } from '../../../../types/types'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import _ from 'lodash'
import { fetchFinishedElectionWithVotes } from '../../api/elections'

export const Audit = () => {
  const [election, setElection] = useState<Election | null>(null)
  const [ballots, setBallots] = useState<Ballot[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('translation', { keyPrefix: 'voter.audit' })

  useEffect(() => {
    void (async () => {
      const response = await fetchFinishedElectionWithVotes()

      if (!response.ok) {
        setLoading(false)
        return
      }

      setBallots(response.data.ballots)
      setElection(response.data.election)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!election || !ballots) {
    return (
      <Card>
        <Card.Header as="h2">{t('title')}</Card.Header>
        <Card.Body>
          <Alert className="d-flex flex-column text-center" variant="info">
            <Alert.Heading>
              {t('election_not_ongoing_or_finished')}
            </Alert.Heading>
            <p>{t('election_not_ongoing_or_finished_description')}</p>
          </Alert>
        </Card.Body>
      </Card>
    )
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = election.candidates.find(
      (candidate) => candidate.candidateId === candidateId
    )

    return candidate?.name || candidateId
  }

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Header as="h4">{election.title}</Card.Header>
      <Card.Body>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('ballot_id')}</th>
              <th>{t('ballot')}</th>
            </tr>
          </thead>
          <tbody>
            {ballots.map((audit, index) => (
              <tr key={index}>
                <td>{audit.ballotId}</td>
                <td>
                  <Table striped bordered hover>
                    <tbody>
                      <tr>
                        <td colSpan={2}>
                          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {audit.votes.length > 0
                              ? _.orderBy(audit.votes, 'preferenceNumber').map(
                                  (vote, index) => (
                                    <div
                                      key={index}
                                      style={{ marginRight: '10px' }}
                                    >
                                      {vote.preferenceNumber}.{' '}
                                      {getCandidateName(vote.candidateId)}
                                    </div>
                                  )
                                )
                              : t('empty_ballot')}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}
