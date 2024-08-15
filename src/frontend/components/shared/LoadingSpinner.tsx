import React from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const LoadingSpinner = () => {
  const { t } = useTranslation("translation", { keyPrefix: "app" })
  return (
    <Container className="text-center">
      <Spinner animation="border" role="status">
        <span className="sr-only">{t("loading")}</span>
      </Spinner>
    </Container>
  )
}
