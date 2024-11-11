import React from 'react'
import { Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const Info = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'voter.info' })

  return (
    <Card>
      <Card.Header as="h2">{t('title')}</Card.Header>
      <Card.Body>
        <Card.Text>{t('info')}</Card.Text>
        <Card.Text>{t('info_2')}</Card.Text>
        <Card.Text>{t('info_3')}</Card.Text>
      </Card.Body>
    </Card>
  )
}
