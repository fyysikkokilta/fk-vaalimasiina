import React, { useContext, useState } from 'react'
import { Col, Container, Form, ListGroup } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

import { ElectionStepContext } from '../../../../contexts/electionStep/ElectionStepContext'
import { trpc } from '../../../../trpc/trpc'
import { AdminNavigation } from '../adminNavigation/AdminNavigation'

export const PreviewElection = () => {
  const { election, setElection } = useContext(ElectionStepContext)!
  const [emails, setEmails] = useState('')
  const { t } = useTranslation('translation', {
    keyPrefix: 'admin.admin_main.preview_election'
  })
  const startVoting = trpc.admin.elections.startVoting.useMutation()

  const getEmailLinesContainingText = (emails: string) => {
    return emails
      .split('\n')
      .map((email) => email.trim())
      .map((email) => email.toLowerCase())
      .filter(Boolean)
  }

  const validateEmails = (emails: string) => {
    const notEmpty = emails.trim().length > 0
    const emailArray = getEmailLinesContainingText(emails)
    const emailsOkay = emailArray.every((email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    })
    const allEmailsUnique = emailArray.length === new Set(emailArray).size
    return notEmpty && emailsOkay && allEmailsUnique
  }

  const handleSubmit = async (electionId: string) => {
    const { status } = await startVoting.mutateAsync({
      electionId,
      emails: getEmailLinesContainingText(emails)
    })
    setElection((election) => ({ ...election, status }))
    return true
  }

  const getValidEmailCount = (emailString: string) => {
    return getEmailLinesContainingText(emailString).length
  }

  return (
    <>
      <AdminNavigation
        disableNext={!validateEmails(emails)}
        onNext={() => handleSubmit(election.electionId)}
      />
      <Container className="d-flex flex-column align-items-center">
        <h3 className="mb-3">{election.title}</h3>
        <div className="mb-3">{election.description}</div>
        <div className="mb-3">
          {t('seats')}: {election.seats}
        </div>
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
        {emails.length > 0 &&
          (validateEmails(emails) ? (
            <div className="text-success mt-2 text-center">
              {t('voter_count')}: {getValidEmailCount(emails)}
            </div>
          ) : (
            <div className="text-danger mt-2 text-center">
              {t('invalid_emails')}
            </div>
          ))}
      </Container>
    </>
  )
}
