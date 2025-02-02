import { exists } from 'i18next'
import React, { useEffect, useRef } from 'react'
import { Alert, Button } from 'react-bootstrap'
import type { FallbackProps } from 'react-error-boundary'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

import { isTRPCClientError } from '../../trpc/trpc'

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  const { t } = useTranslation('translation')
  const location = useLocation()
  const errorLocation = useRef(location.pathname)
  const navigate = useNavigate()

  useEffect(() => {
    if (location.pathname !== errorLocation.current) {
      resetErrorBoundary()
    }
  }, [location.pathname, resetErrorBoundary])

  const handleBackToFrontpage = async () => {
    resetErrorBoundary()
    await navigate('/')
  }

  const handleReload = () => {
    resetErrorBoundary()
    window.location.reload()
  }

  return (
    <Alert className="m-0" variant="danger" role="alert">
      <Alert.Heading>{t('error_boundary.title')}</Alert.Heading>
      <p>{t('error_boundary.message')}</p>
      {isTRPCClientError(error) && (
        <p>
          {t('error_boundary.error_message')}:{' '}
          {exists(`errors.${error.message}`)
            ? t(`errors.${error.message}`)
            : error.message}
        </p>
      )}
      <Button className="m-1" variant="secondary" onClick={handleReload}>
        {t('error_boundary.reload')}
      </Button>
      <Button className="m-1" variant="primary" onClick={handleBackToFrontpage}>
        {t('error_boundary.back_to_frontpage')}
      </Button>
    </Alert>
  )
}

export default ErrorFallback
