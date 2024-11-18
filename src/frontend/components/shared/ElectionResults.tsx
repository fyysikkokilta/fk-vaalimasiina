import React from 'react'
import { Button, Card, Col, ListGroup, Row, Table } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { Election } from '../../../../types/types'
import { VotingResult } from '../../utils/stvAlgorithm'

type ElectionResultsProps = {
  election: Election
  votingResult: VotingResult
}

export const ElectionResults = ({
  election,
  votingResult
}: ElectionResultsProps) => {
  const { t } = useTranslation('translation', {
    keyPrefix: 'results'
  })

  const roundToTwoDecimals = (num: number) =>
    Math.round((num + Number.EPSILON) * 100) / 100

  const exportBallotsToCSV = () => {
    const headers = Array.from(
      { length: election.candidates.length },
      (_, i) => `Preference ${i + 1}`
    )

    const rows = votingResult.ballots.map((ballot) =>
      ballot.votes.map(
        ({ candidateId }) =>
          election.candidates.find((c) => c.candidateId === candidateId)!.name
      )
    )

    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.join(';'))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = election.title + '.csv'
    a.click()
  }

  const getMinutesParagraphs = async () => {
    const totalVotes = votingResult.totalVotes
    const emptyVotes = votingResult.totalVotes - votingResult.nonEmptyVotes
    const sortedCandidates = election.candidates.sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    const firstParagraph = `Ääniä annettiin ${totalVotes} ${totalVotes > 1 ? 'kappaletta' : 'kappale'}, joista ${emptyVotes} oli ${emptyVotes > 1 ? 'tyhjiä' : 'tyhjä'}. Äänestystulos oli vaalikelpoinen.`
    const firstDecimalVotesRound = votingResult.roundResults.find(
      ({ candidateResults }) => {
        return candidateResults.some(({ voteCount }) => voteCount % 1 !== 0)
      }
    )
    const secondParagraph = firstDecimalVotesRound
      ? `Siirtoäänivaalitavasta johtuen päädyttiin desimaaliääniin ${firstDecimalVotesRound.round} kierroksella. Äänet on kirjattu pöytäkirjaan kahden desimaalin tarkkuudella.`
      : null

    const roundParagraphs = votingResult.roundResults.map(
      ({ round, candidateResults, tieBreaker, emptyVotes }) => {
        const quota = votingResult.quota
        const voteNameString = `Tulos ${round}. kierroksella (äänikynnys ${quota}): ${sortedCandidates
          .map(({ name, candidateId }) => {
            const candidate = candidateResults.find((c) => c.id === candidateId)
            return `${name} ${candidate ? roundToTwoDecimals(candidate.voteCount) : '-'}${candidate?.isSelected ? ' (valittu)' : ''}`
          })
          .join('; ')}; tyhjiä ${emptyVotes}.`

        const winnersThisRound = candidateResults.filter(
          (c) => c.isSelectedThisRound
        )
        const winnersNames = winnersThisRound
          .map(({ name }) => name)
          .join(' ja ')

        const winnersString =
          winnersThisRound.length > 0
            ? `${winnersNames} ${winnersThisRound.length > 1 ? 'ylittivät' : 'ylitti'} äänikynnyksen ja merkittiin täten äänestyksessä ${winnersThisRound.length > 1 ? 'valituiksi' : 'valituksi'}.`
            : null

        const droppedCandidate = candidateResults.find(
          ({ isEliminated }) => isEliminated
        )
        const droppedCandidateString = droppedCandidate
          ? `Kukaan ei ylittänyt äänikynnystä ${round}. kierroksella, joten pudotettiin vähiten ääniä saanut ehdokas ${droppedCandidate.name} pois. ${tieBreaker ? 'Pudotuksen ratkaisi arpa.' : ''}`
          : null

        const winnersExtraParagraph =
          winnersThisRound.length > 0 &&
          round < votingResult.roundResults.length
            ? `${round + 1}. kierroksella jaettiin ${winnersNames} äänikynnyksen ylittäneet ${winnersThisRound.map(({ voteCount }) => voteCount - quota).join(' ja ')} ääntä muille ehdokkaille siirtoäänivaalitavan määräämillä kertoimilla painotettuna.`
            : null

        const paragraph = [
          voteNameString,
          winnersString,
          droppedCandidateString
        ]
          .filter((s) => s)
          .join(' ')

        return [paragraph, winnersExtraParagraph].filter((s) => s).join('\n\n')
      }
    )

    const winnersParagraph = `Äänestystuloksen perusteella päätettiin valita ${votingResult.winners.map(({ name }) => name).join(' ja ')} Fyysikkokillan rooliin X vuodelle YYYY ajassa ZZ.ZZ.`

    await navigator.clipboard.writeText(
      [firstParagraph, secondParagraph, ...roundParagraphs, winnersParagraph]
        .filter((s) => s)
        .join('\n\n')
    )
    toast.success(t('minutes_copied_to_clipboard'))
  }

  return (
    <>
      <Row className="mb-4">
        <Col className="mb-3 text-center">
          <h3>{election.title}</h3>
          <Row>
            <span className="mt-3">
              {t('total_votes')}: {votingResult.totalVotes}
            </span>
            <span className="mt-3">
              {t('non_empty_votes')}: {votingResult.nonEmptyVotes}
            </span>
          </Row>
          <Button onClick={exportBallotsToCSV} className="mt-3 mx-2">
            {t('export_csv')}
          </Button>
          <Button onClick={getMinutesParagraphs} className="mt-3 mx-2">
            {t('export_minutes')}
          </Button>
        </Col>
      </Row>
      <ListGroup>
        {votingResult.roundResults.map(
          ({ candidateResults, round, tieBreaker, emptyVotes }) => (
            <ListGroup.Item
              id={`round-${round}`}
              key={round}
              className="mb-3 text-center"
            >
              <Card>
                <Card.Header as="h5">
                  {t('round')} {round}
                </Card.Header>
                <Card.Body>
                  <Card.Title>
                    &nbsp; {t('election_threshold')}:&nbsp;{votingResult.quota}
                  </Card.Title>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>{t('candidate_name')}</th>
                        <th>{t('vote_count')}</th>
                        <th>{t('result')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateResults.map(
                        ({ id, name, voteCount, isSelected, isEliminated }) => (
                          <tr key={id}>
                            <td>{name}</td>
                            <td>{roundToTwoDecimals(voteCount)}</td>
                            <td>
                              {isSelected && (
                                <span className="text-success">
                                  {t('chosen')}
                                </span>
                              )}
                              {isEliminated && (
                                <span className="text-danger">
                                  {t('eliminated')}
                                  {tieBreaker && ` - ${t('tie_breaker')}`}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                      <tr>
                        <td>{t('empty_votes')}</td>
                        <td>{roundToTwoDecimals(emptyVotes)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </ListGroup.Item>
          )
        )}
      </ListGroup>
      <Row>
        <Col id="winners" className="text-center">
          <h4>{t('chosen_candidates')}</h4>
          <ListGroup>
            {votingResult.winners.map(({ id, name }) => (
              <ListGroup.Item key={id}>{name}</ListGroup.Item>
            ))}
          </ListGroup>
        </Col>
      </Row>
    </>
  )
}
