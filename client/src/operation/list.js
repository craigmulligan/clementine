import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'react-router-dom'
import KeyMetrics from '../keyMetrics'
import { FiltersContext } from '../trace'
import Pill from '../pill'
import Nav from '../nav'
import { getOperationName, getOperationTypes } from './utils'
import styles from './list.module.css'

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

export default function OperationList({ graphId }) {
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
      <Pill
        isActive={true}
        onClick={() => {
          setOrderAsc(prev => !prev)
        }}
      >
        {orderAsc ? 'desc' : 'asc'}
      </Pill>
      <Pill
        isActive={orderField === 'count'}
        onClick={() => {
          setOrderField('count')
        }}
      >
        popular
      </Pill>
      <Pill
        isActive={orderField === 'duration'}
        onClick={() => {
          setOrderField('duration')
        }}
      >
        slowest
      </Pill>
      <Pill
        isActive={orderField === 'errorCount'}
        onClick={() => {
          setOrderField('errorCount')
        }}
      >
        Most Errors
      </Pill>
      <Pill
        isActive={orderField === 'errorPercent'}
        onClick={() => {
          setOrderField('errorPercent')
        }}
      >
        Highest Error Rate
      </Pill>
      <div>
        {data.operations.nodes.map(op => {
          const doc = gql`
            ${op.key}
          `
          const name = getOperationName(doc)
          const operationTypes = getOperationTypes(doc)

          return (
            <Link key={op.id} to={`/graph/${graphId}/operation/${op.id}`}>
              <div className={styles.row}>
                <div>{op.id.substring(0, 5)} </div>
                <div>
                  <code>{name ? name : op.id}</code>
                </div>
                <KeyMetrics {...op.stats} />
                <Pill>{operationTypes.join(' ')}</Pill>
              </div>
              <hr />
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
      </div>
    </div>
  )
}
