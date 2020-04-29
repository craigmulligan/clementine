import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner, NotFound } from '../utils'
import { Link } from 'react-router-dom'
import Stats from '../stats'
import { FiltersContext } from '../trace'
import { getOperationName, getOperationTypes } from './utils'
import styles from './list.module.css'
import Label from '../label'
import OrderBy from '../orderby'

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
    return <NotFound />
  }

  return (
    <main>
      <div>
        <OrderBy
          fields={[
            { label: 'Popular', field: 'count' },
            { label: 'Latency', field: 'duration' },
            { label: 'Error', field: 'errorCount' },
            { label: 'Error rate', field: 'errorPercent' }
          ]}
          setOrderAsc={setOrderAsc}
          orderAsc={orderAsc}
          setOrderField={setOrderField}
          orderField={orderField}
        />
        <div>
          {data.operations.nodes.map(op => {
            const doc = gql`
              ${op.key}
            `
            const name = getOperationName(doc)
            const operationTypes = getOperationTypes(doc)

            return (
              <Link
                key={op.id}
                to={`/graph/${graphId}/operation/${op.id}/trace`}
              >
                <div className={styles.row}>
                  <div>{op.id.substring(0, 5)} </div>
                  <div>
                    <code>{name ? name : op.id}</code>
                  </div>
                  <div className={styles.rowRight}>
                    <Stats {...op.stats} />
                    <Label
                      type={
                        operationTypes.includes('mutation') ? 'orange' : 'green'
                      }
                    />
                  </div>
                </div>
              </Link>
            )
          })}
          <button
            className={'w-100'}
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
    </main>
  )
}
