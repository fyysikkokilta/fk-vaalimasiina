import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'

export const Info = () => {
  const { t } = useTranslation("translation", { keyPrefix: "voter.info" })

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="box-shadow">
            <Card.Header as="h2">{t("title")}</Card.Header>
            <Card.Body>
              <Card.Text>
                {t("info")}
              </Card.Text>
              <Card.Text>
                {t("info_2")}
              </Card.Text>
              <Card.Text>
                {t("info_3")}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}
