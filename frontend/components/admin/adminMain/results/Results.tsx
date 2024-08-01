import React, { useContext, useEffect, useState } from 'react'
import { Container, Row, Col, ListGroup, Spinner, Card } from 'react-bootstrap'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import {
  calculateSTVResult,
  VotingResult,
} from '../../../../utils/stvAlgorithm'
import styles from './results.module.scss'
import { getVotesForElection } from '../../../../api/admin/votes'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { closeElection } from '../../../../api/admin/elections'

export const Results = () => {
  const { election } = useContext(ElectionContext)!
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null)

  useEffect(() => {
    ;(async () => {
      if (!election) {
        return
      }
      // Fetch voting results
      const response = await getVotesForElection(election.electionId!)

      if (!response.ok) {
        return
      }

      setVotingResult(
        calculateSTVResult(
          election.candidates,
          response.data,
          election.amountToElect
        )
      )
    })()
  }, [election])

  if (!election || !votingResult) {
    return <LoadingSpinner />
  }

  const getCandidateName = (candidateId: string) => {
    const candidate = election.candidates.find(
      (c) => c.candidateId === candidateId
    )!
    return candidate.name
  }

  return (
    <>
      <AdminNavigation
        disableNavigation={false}
        onNext={() => closeElection(election.electionId)}
      />
      {!votingResult || !election ? (
        <Container className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      ) : (
        <Container className={styles.resultsContainer}>
          <Row className="mb-4">
            <Col className="mb-3 text-center">
              <h3>{election.title}</h3>
              <Row>
                <span className="mt-3">
                  Äänestäjiä: {votingResult.totalVoters}
                </span>
                <span className="mt-3">
                  Epätyhjiä ääniä: {votingResult.totalVotes}
                </span>
              </Row>
            </Col>
          </Row>
          <ListGroup>
            {votingResult.roundResults.map(
              ({ droppedCandidate, candidateResults, quota, round }) => (
                <ListGroup.Item key={round} className="mb-3 text-center">
                  <Card>
                    <Card.Header as="h5">Kierros {round}</Card.Header>
                    <Card.Body>
                      <Card.Title>
                        Valittavia jäljellä:&nbsp;
                        {election.amountToElect -
                          candidateResults.filter(
                            ({ isSelected }) => isSelected
                          ).length}
                        &nbsp; Äänikynnys:&nbsp;{quota}
                      </Card.Title>
                      <ListGroup variant="flush">
                        {candidateResults.map(({ data, isSelected }) => (
                          <ListGroup.Item key={data.id}>
                            {getCandidateName(data.id)} - {data.voteCount} ääntä
                            {isSelected && (
                              <span className="text-success"> - Valittu</span>
                            )}
                          </ListGroup.Item>
                        ))}
                        {droppedCandidate && (
                          <ListGroup.Item className="text-danger">
                            {getCandidateName(droppedCandidate.id)} putosi
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
              <h4>Valitut ehdokkaat</h4>
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
      )}
    </>
  )
}
