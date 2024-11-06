import React, { useEffect, useState } from 'react'
import { Election } from '../../../../types/types'
import { Link } from 'react-router-dom'
import { fetchCompletedElections } from '../../api/elections'
import { Card, Container, ListGroup, ListGroupItem } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../shared/LoadingSpinner'

export const PreviousElectionList = () => {
  const [elections, setElections] = useState<Election[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  useEffect(() => {
    // eslint-disable-next-line no-extra-semi
    ;(async () => {
      const electionsData = await fetchCompletedElections()

      if (!electionsData.ok) {
        setLoading(false)
        return
      }
      const elections = electionsData.data
      setElections(elections)
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <Card className="box-shadow m-5">
      <Card.Header>
        <h1>{t('title')}</h1>
      </Card.Header>
      <Card.Body>
        {elections.length > 0 ? (
          <Container>
            <ListGroup>
              {elections.map((election) => (
                <ListGroupItem
                  key={election.electionId}
                  className="text-center"
                >
                  <Link to={`/elections/${election.electionId}`}>
                    {election.title}
                  </Link>
                </ListGroupItem>
              ))}
            </ListGroup>
          </Container>
        ) : (
          <Container>
            <span>{t('no_previous_results')}</span>
            <p>{t('no_previous_results_description')}</p>
          </Container>
        )}
      </Card.Body>
    </Card>
  )
}
