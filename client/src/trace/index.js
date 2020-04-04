import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import TracingReponse from './TracingReponse'
import Filters from './filters'

const TRACE_LIST = gql`
  query traceList(
    $graphId: ID!
    $operationId: ID!
    $after: String
    $orderBy: TraceOrderBy
  ) {
    traces(
      graphId: $graphId
      operationId: $operationId
      after: $after
      orderBy: $orderBy
    ) {
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
  const [orderField, setOrderField] = useState('duration')
  const [orderAsc, setOrderAsc] = useState(false)
  const { loading, error, data } = useQuery(TRACE_LIST, {
    variables: {
      graphId,
      operationId,
      orderBy: {
        field: orderField,
        asc: orderAsc
      }
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (data.traces.nodes.length === 0) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <button
        onClick={() => {
          setOrderAsc(prev => !prev)
        }}
      >
        {orderAsc ? 'desc' : 'asc'}
      </button>
      <button
        onClick={() => {
          setOrderField('startTime')
        }}
      >
        Time
      </button>
      <button
        onClick={() => {
          setOrderField('duration')
        }}
      >
        Duration
      </button>
      <ul>
        {data.traces.nodes.map(trace => {
          return (
            <li key={trace.id}>
              <details>
                <summary>
                  {trace.id} - {trace.startTime} - {trace.duration}
                </summary>
                <TracingReponse
                  tracing={trace.root}
                  duration={trace.duration}
                  startTime={trace.startTime}
                />
              </details>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export { Filters }
