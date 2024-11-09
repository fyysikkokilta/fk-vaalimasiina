import React, { useState, useEffect, useContext } from 'react'
import { Container, Table, Alert, Card, Row, Col } from 'react-bootstrap'
import { getVotesForElection } from '../../api/votes'
import { Ballot } from '../../../../types/types'
import { ElectionContext } from '../../contexts/election/ElectionContext'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../shared/LoadingSpinner'
import _ from 'lodash'

export const Audit = () => {
  const { election } = useContext(ElectionContext)!
  const [ballots, setBallots] = useState<Ballot[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('translation', { keyPrefix: 'voter.audit' })

  useEffect(() => {
    ;(async () => {
      if (!election) {
        return
      }
      const response = await getVotesForElection(election.electionId)

      if (!response.ok) {
        return
      }

      setBallots(response.data)
      setLoading(false)
    })()
  }, [election])

  if (!election) {
    return (
      <Container className="mt-5 mb-5">
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="box-shadow">
              <Card.Header as="h2">{t('title')}</Card.Header>
              <Card.Body>
                <Alert
                  className="mx-5 d-flex flex-column text-center"
                  variant="info"
                >
                  <Alert.Heading className="mb-3">
                    {t('election_not_ongoing_or_finished')}
                  </Alert.Heading>
                  <p>{t('election_not_ongoing_or_finished_description')}</p>
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = election.candidates.find(
      (candidate) => candidate.candidateId === candidateId
    )

    return candidate?.name || candidateId
  }

  return (
    <Container className="mt-5 mb-5">
      <Card className="box-shadow">
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
                                ? _.orderBy(
                                    audit.votes,
                                    'preferenceNumber'
                                  ).map((vote, index) => (
                                    <div
                                      key={index}
                                      style={{ marginRight: '10px' }}
                                    >
                                      {vote.preferenceNumber}.{' '}
                                      {getCandidateName(vote.candidateId)}
                                    </div>
                                  ))
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
    </Container>
  )
}
