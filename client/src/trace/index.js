import React, { useState } from 'react'
import { getOperationName } from 'apollo-utilities'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import TracingReponse from './TracingReponse'

const TRACE_LIST = gql`
  query traceList($graphId: ID!, $operationId: ID!, $after: String) {
    traces(graphId: $graphId, operationId: $operationId, after: $after) {
      nodes {
        id
        duration
        startTime
        endTime
        root
      }
      cursor
    }
  }
`

export function TraceList({ graphId, operationId }) {
  const { loading, error, data, fetchMore } = useQuery(TRACE_LIST, {
    variables: {
      graphId,
      operationId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (data.traces.nodes.length === 0) {
    return <div>Not Found</div>
  }

  const trace = data.traces.nodes[0]

  return (
    <div>
      <Link to={`/graph/${graphId}/operation/${operationId}/trace/${trace.id}`}>
        <li key={trace.id}>
          <span>
            <mark>{trace.duration}</mark>
            <TracingReponse
              tracing={trace.root}
              duration={trace.duration}
              startTime={trace.startTime}
            />
          </span>
        </li>
      </Link>
    </div>
  )
}
