import React, { useState, useEffect, useContext } from 'react'

import styles from './previewElection.module.scss'

import { Col, Container, ListGroup, Spinner } from 'react-bootstrap'

import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { startVoting } from '../../../../api/admin/elections'
import { getActiveVoterCount } from '../../../../api/admin/voter'

export const PreviewElection = () => {
  const { election } = useContext(ElectionContext)!
  const [amountOfVoters, setAmountOfVoters] = useState<number>(0)

  const fetchAndSetVoterCount = async () => {
    const response = await getActiveVoterCount()
    if (!response.ok) {
      return
    }
    setAmountOfVoters(response.data)
  }

  useEffect(() => {
    fetchAndSetVoterCount()
    const interval = setInterval(() => fetchAndSetVoterCount(), 3000)
    return () => clearInterval(interval)
  }, [])

  if (!election) {
    return <LoadingSpinner />
  }

  return (
    <>
      <AdminNavigation onNext={() => startVoting(election.electionId)} />
      {!election ? (
        <Container className="text-center">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </Container>
      ) : (
        <Container className={styles.previewElectionContainer}>
          <Col>
            <h3>{election.title}</h3>
            <p>{election.description}</p>
            <span>Valitaan: {election.amountToElect}</span>
            <h4>Ehdokkaita</h4>
            <Col>
              <ListGroup numbered>
                {election.candidates.map((candidate) => (
                  <ListGroup.Item key={candidate.candidateId}>
                    {candidate.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <h4 className="mt-3">Äänestäjiä</h4>
            <p>{amountOfVoters}</p>
          </Col>
        </Container>
      )}
    </>
  )
}
