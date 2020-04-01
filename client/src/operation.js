import React, { useState } from 'react'
import { getOperationName } from 'apollo-utilities'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from './utils'
import { Link } from 'wouter'
import KeyMetrics from './keyMetrics'
import { print } from 'graphql/language/printer'
import { TraceList } from './trace'

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
  ) {
    operations(graphId: $graphId, orderBy: $orderBy, after: $after) {
      nodes {
        id
        key
        keyMetrics {
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

export function OperationShow({ graphId, operationId }) {
  // <p><Link to=`/graph/${graphId}/operation/${operationId}/trace`>Traces</Link>
  return (
    <div>
      {operationId}
      <Source>{atob(operationId)}</Source>
      <TraceList graphId={graphId} operationId={operationId} />
    </div>
  )
}

export function OperationList({ graphId }) {
  const [orderField, setOrderField] = useState('count')
  const [orderAsc, setOrderAsc] = useState(false)
  const { loading, error, data, fetchMore } = useQuery(OPERATION_LIST, {
    variables: {
      graphId,
      orderBy: {
        field: orderField,
        asc: orderAsc
      }
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (data.operations.nodes.length === 0) {
    return <div>Not Found</div>
  }

  return (
    <ul>
      <button
        onClick={() => {
          setOrderAsc(prev => !prev)
        }}
      >
        {orderAsc ? 'desc' : 'asc'}
      </button>
      <button
        onStalledCapture
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
      {data.operations.nodes.map(op => {
        const doc = gql`
          ${op.key}
        `
        const name = getOperationName(doc)
        const operationTypes = getOperationTypes(doc)

        return (
          <Link to={`/graph/${graphId}/operation/${op.id}`}>
            <li key={op.id}>
              <span>
                <mark>{name ? name : op.id}</mark>
              </span>
              <KeyMetrics {...op.keyMetrics} />
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
  )
}

function Source({ children }) {
  return (
    <div>
      <pre>
        <code>
          {print(
            gql`
              ${children}
            `
          )}
        </code>
      </pre>
    </div>
  )
}
