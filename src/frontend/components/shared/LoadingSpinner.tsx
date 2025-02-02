import React from 'react'
import { Alert, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const LoadingSpinner = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'app' })
  return (
    <Alert variant="light" className="text-center p-5 shadow-sm border m-0">
      <div className="loading-content">
        <Spinner
          animation="border"
          role="status"
          variant="primary"
          style={{ width: '4rem', height: '4rem' }}
        />
        <div className="mt-3 loading-text fw-bold">{t('loading')}...</div>
      </div>
    </Alert>
  )
}
