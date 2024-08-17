import React, { useState, useEffect, useContext } from 'react'

import styles from './previewElection.module.scss'

import { Col, Container, ListGroup } from 'react-bootstrap'

import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { startVoting } from '../../../../api/admin/elections'
import { getActiveVoterCount } from '../../../../api/admin/voter'
import { useTranslation } from 'react-i18next'

export const PreviewElection = () => {
  const { election, setElection } = useContext(ElectionContext)!
  const [amountOfVoters, setAmountOfVoters] = useState<number>(0)
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.preview_election',
  })

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

  const handleStartVoting = async () => {
    const response = await startVoting(election.electionId)
    if (!response.ok) {
      return false
    }
    setElection((election) => ({ ...election!, status: 'ONGOING' }))
    return true
  }

  return (
    <>
      <AdminNavigation onNext={handleStartVoting} />
      {!election ? (
        <LoadingSpinner />
      ) : (
        <Container className={styles.previewElectionContainer}>
          <Col>
            <h3>{election.title}</h3>
            <p>{election.description}</p>
            <span>
              {t('amount_to_choose')}: {election.amountToElect}
            </span>
            <h4>{t('candidates')}</h4>
            <Col>
              <ListGroup numbered>
                {election.candidates.map((candidate) => (
                  <ListGroup.Item key={candidate.candidateId}>
                    {candidate.name}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Col>
            <h4 className="mt-3">{t('voters')}</h4>
            <p>{amountOfVoters}</p>
          </Col>
        </Container>
      )}
    </>
  )
}
