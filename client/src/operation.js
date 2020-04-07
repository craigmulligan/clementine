import React, { useState, useContext } from 'react'
import { getOperationName } from 'apollo-utilities'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from './utils'
import { Link } from 'wouter'
import KeyMetrics from './keyMetrics'
import { FiltersContext } from './trace'

function getOperationTypes(doc) {
  let operationTypes = []

  const definitions = doc.definitions.filter(
    definition => definition.kind === 'OperationDefinition'
  )

  const isQuery = definitions.some(def => def.operation === 'query')
  const isMutation = definitions.some(def => def.operation === 'mutation')

  if (isQuery) {
    operationTypes.push('query')
  }

  if (isMutation) {
    operationTypes.push('mutation')
  }

  return operationTypes
}

const OPERATION_LIST = gql`
  query operationList(
    $graphId: ID!
    $orderBy: OperationOrderBy
    $after: String
    $to: DateTime
    $from: DateTime
    $traceFilters: [TraceFilter]
  ) {
    operations(
      graphId: $graphId
      orderBy: $orderBy
      after: $after
      traceFilters: $traceFilters
      to: $to
      from: $from
    ) {
      nodes {
        id
        key
        stats {
          count
          errorCount
          errorPercent
          duration
        }
      }
      cursor
    }
  }
`

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

  return (
    <div>
      <header>
        <h2>{operationId}</h2>
        <KeyMetrics {...data.operation.stats} />
      </header>
      <hr />
    </div>
  )
}

export function OperationShow({ graphId, operationId }) {
  return (
    <div>
      <ul>
        <Link to={`/graph/${graphId}/operation/${operationId}/trace`}>
          <li>
            <h4>Traces</h4>
            <small>
              Drill down into individual traces to find slow resolvers.
            </small>
          </li>
        </Link>
        <Link to={`/graph/${graphId}/operation/${operationId}/rpm`}>
          <li>
            <h4>RPM</h4>
            <small>Get a feel for your traffic over time</small>
          </li>
        </Link>
        <Link to={`/graph/${graphId}/operation/${operationId}/ld`}>
          <li>
            <h4>Latency Distribution</h4>
            <small>What it says on the tin</small>
          </li>
        </Link>
      </ul>
    </div>
  )
}

export function OperationList({ graphId }) {
  const { filters, to, from } = useContext(FiltersContext)
  const [orderField, setOrderField] = useState('count')
  const [orderAsc, setOrderAsc] = useState(false)

  const { loading, error, data, fetchMore } = useQuery(OPERATION_LIST, {
    variables: {
      graphId,
      orderBy: {
        field: orderField,
        asc: orderAsc
      },
      to,
      from,
      traceFilters: filters
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (data.operations.nodes.length === 0) {
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
          setOrderField('count')
        }}
      >
        popular
      </button>
      <button
        onClick={() => {
          setOrderField('duration')
        }}
      >
        slowest
      </button>
      <button
        onClick={() => {
          setOrderField('errorCount')
        }}
      >
        Most Errors
      </button>
      <button
        onClick={() => {
          setOrderField('errorPercent')
        }}
      >
        Highest Error Rate
      </button>
      <ul>
        {data.operations.nodes.map(op => {
          const doc = gql`
            ${op.key}
          `
          const name = getOperationName(doc)
          const operationTypes = getOperationTypes(doc)

          return (
            <Link key={op.id} to={`/graph/${graphId}/operation/${op.id}`}>
              <li>
                <span>{op.id.substring(0, 5)} </span>
                <span>
                  <mark>{name ? name : op.id}</mark>
                </span>
                <KeyMetrics {...op.stats} />
                <span>&nbsp;{operationTypes.join(' ')}</span>
              </li>
            </Link>
          )
        })}
        <button
          disabled={data.operations.cursor.length === 0}
          onClick={() => {
            fetchMore({
              variables: {
                graphId,
                orderBy: {
                  field: orderField,
                  asc: orderAsc
                },
                after: data.operations.cursor
              },
              updateQuery: (previousResult, { fetchMoreResult }) => {
                const prevOps = previousResult.operations.nodes
                const newOps = fetchMoreResult.operations.nodes
                const nodes = [...prevOps, ...newOps]

                return {
                  operations: {
                    // Put the new comments in the front of the list
                    ...fetchMoreResult.operations,
                    nodes
                  }
                }
              }
            })
          }}
        >
          {data.operations.cursor.length === 0 ? 'no more' : 'more'}
        </button>
      </ul>
    </div>
  )
}
