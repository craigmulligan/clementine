import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'react-router-dom'
import Stats from '../stats'
import { FiltersContext } from '../trace'
import Nav from '../nav'
import OperationList from './list'
import { getOperationName } from './utils'
import { Filters } from '../trace'

const OPERATION_HEADER = gql`
  query operationHeader(
    $graphId: ID!
    $operationId: ID!
    $to: DateTime
    $from: DateTime
    $traceFilters: [TraceFilter]
  ) {
    operation(
      graphId: $graphId
      operationId: $operationId
      traceFilters: $traceFilters
      to: $to
      from: $from
    ) {
      id
      key
      stats {
        count
        errorCount
        errorPercent
        duration
      }
    }
  }
`

export function OperationHeader({ graphId, operationId, stats }) {
  const { filters, to, from } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(OPERATION_HEADER, {
    variables: {
      graphId,
      operationId,
      to,
      from,
      traceFilters: filters
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  const items = [
    {
      title: 'Traces',
      to: `/graph/${graphId}/operation/${operationId}/trace`
    },
    {
      title: 'Requests over time',
      to: `/graph/${graphId}/operation/${operationId}/rpm`
    },
    {
      title: 'Latency Distribution',
      to: `/graph/${graphId}/operation/${operationId}/ld`
    }
  ]

  let name
  if (data.operation) {
    const doc = gql`
      ${data.operation.key}
    `
    name = getOperationName(doc)
  }

  const operationStats = data.operation ? data.operation.stats : {}

  return (
    <div>
      <header>
        <Link to={`/graph/${graphId}/operation/${operationId}`}>
          <h2>{name ? name : operationId}</h2>
        </Link>
        <Filters graphId={graphId} />
        <Stats {...operationStats} />
      </header>
      <Nav items={items} />
    </div>
  )
}

export { OperationList }
