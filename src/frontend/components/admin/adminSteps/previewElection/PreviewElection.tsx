import React, { useState, useContext } from 'react'

import styles from './previewElection.module.scss'

import { Col, Container, Form, ListGroup } from 'react-bootstrap'

import { AdminNavigation } from '../adminNavigation/AdminNavigation'
import { ElectionContext } from '../../../../contexts/election/ElectionContext'
import { LoadingSpinner } from '../../../shared/LoadingSpinner'
import { startVoting } from '../../../../api/admin/elections'
import { useTranslation } from 'react-i18next'

export const PreviewElection = () => {
  const { election, setElection } = useContext(ElectionContext)!
  const [emails, setEmails] = useState('')
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.preview_election',
  })

  if (!election) {
    return <LoadingSpinner />
  }

  const validateEmails = (emails: string) => {
    const emailArray = emails.split('\n')
    const emailsOkay = emailArray.every((email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    })
    const allEmailsUnique = emailArray.length === new Set(emailArray).size
    return emailsOkay && allEmailsUnique
  }

  const handleSubmit = async () => {
    const response = await startVoting(election.electionId, emails.split('\n'))
    if (!response.ok) {
      return false
    }
    setElection((election) => ({ ...election!, status: 'ONGOING' }))
    return true
  }

  return (
    <>
      <AdminNavigation
        disableNext={!validateEmails(emails)}
        onNext={handleSubmit}
      />
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
            <Form.Group controlId="emailList">
              <Form.Label>{t('email_list_instruction')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={emails}
                isValid={validateEmails(emails)}
                onChange={(e) => setEmails(e.target.value)}
                placeholder={t('email_list_placeholder')}
              />
            </Form.Group>
          </Col>
        </Container>
      )}
    </>
  )
}