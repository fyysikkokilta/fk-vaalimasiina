import React from 'react'
import { Card, Container, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const LoadingSpinner = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'app' })
  return (
    <Card className="box-shadow m-5">
      <Container className="text-center">
        <span className="sr-only">{t('loading')}</span>
        <Spinner animation="border" role="status" />
      </Container>
    </Card>
  )
}
