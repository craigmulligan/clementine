import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import KeyMetrics from '../keyMetrics'
import { FiltersContext } from '../trace'
import Pill from '../pill'
import Nav from '../nav'
import OperationList from './list'
import { getOperationName } from './utils'

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

  const doc = gql`
    ${data.operation.key}
  `

  const name = getOperationName(doc)

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

  return (
    <div>
      <header>
        <Link to={`/graph/${graphId}/operation/${operationId}`}>
          <h2>{name ? name : operationId}</h2>
        </Link>
        <KeyMetrics {...data.operation.stats} />
      </header>
      <hr />
      <Nav items={items} />
    </div>
  )
}

export { OperationList }
