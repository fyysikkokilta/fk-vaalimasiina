import React, { useState, useEffect, useContext } from 'react'
import { Container, Table, Alert, Card, Row, Col } from 'react-bootstrap'
import { getVotesForElection } from '../../api/votes'
import { Vote } from '../../../../types/types'
import { ElectionContext } from '../../contexts/election/ElectionContext'
import { groupBy, orderBy } from 'lodash'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const Audit = () => {
  const { election } = useContext(ElectionContext)!
  const [votes, setVotes] = useState<Vote[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('translation', { keyPrefix: 'voter.audit' })

  useEffect(() => {
    // eslint-disable-next-line no-extra-semi
    ;(async () => {
      if (!election) {
        return
      }
      const response = await getVotesForElection(election.electionId)

      if (!response.ok) {
        return
      }

      setVotes(response.data)
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

  const ballots = Object.entries(groupBy(votes, 'ballotId')).map(
    ([ballotId, votes]) => ({
      ballotId,
      votes: orderBy(votes, 'preferenceNumber'),
    })
  )

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
          <div className="mb-2">
            {t('empty_vote_notice')}
          </div>
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
                              {audit.votes.map((vote, index) => (
                                <div
                                  key={index}
                                  style={{ marginRight: '10px' }}
                                >
                                  {vote.preferenceNumber}.{' '}
                                  {getCandidateName(vote.candidateId)}
                                </div>
                              ))}
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
