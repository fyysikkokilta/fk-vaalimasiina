import _ from 'lodash'
import React, { useEffect, useState } from 'react'
import { Alert, Card, Form, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { Ballot, Election } from '../../../../types/types'
import { fetchFinishedElectionWithVotes } from '../../api/elections'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const Audit = () => {
  const [election, setElection] = useState<Election | null>(null)
  const [ballots, setBallots] = useState<Ballot[]>([])
  const [search, setSearch] = useState('')
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
            <Alert.Heading>{t('no_finished_election')}</Alert.Heading>
            <p>{t('no_finished_election_description')}</p>
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase().trim()
    setSearch(value)
  }
  const match = ballots.filter(
    (audit) => audit.ballotId.toLowerCase().trim() === search
  )

  const allOrOneBallot = match.length === 1 ? match : ballots

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Header as="h4">{election.title}</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="formSearchBallot">
            <Form.Label>{t('search_ballot')}</Form.Label>
            <Form.Control
              id="searchBallot"
              type="text"
              className="mb-3"
              placeholder={t('ballot_id')}
              onChange={handleSearch}
            />
          </Form.Group>
        </Form>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>{t('ballot_id')}</th>
              <th>{t('ballot')}</th>
            </tr>
          </thead>
          <tbody>
            {allOrOneBallot.map((audit, index) => (
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
