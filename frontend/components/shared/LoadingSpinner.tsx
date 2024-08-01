import React from 'react'
import { Container, Spinner } from 'react-bootstrap'

export const LoadingSpinner = () => {
  return (
    <Container className="text-center">
      <Spinner animation="border" role="status">
        <span className="sr-only">Ladataan...</span>
      </Spinner>
    </Container>
  )
}
