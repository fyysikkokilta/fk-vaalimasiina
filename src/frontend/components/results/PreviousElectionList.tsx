import React from 'react'
import { Card, Container, ListGroup, ListGroupItem } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { trpc } from '../../trpc/trpc'

export const PreviousElectionList = () => {
  const [elections] = trpc.elections.getAllClosed.useSuspenseQuery()
  const { t } = useTranslation('translation', { keyPrefix: 'previous_results' })

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
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
