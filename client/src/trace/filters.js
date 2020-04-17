import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import VisualFilter from 'react-visual-filter'
import styles from './filters.module.css'
import FiltersContext from './filtersContext'
import { Link } from 'react-router-dom'
import './filters.css'

const TRACE_FILTER_OPTIONS = gql`
  query traceFilterOptions($graphId: ID!) {
    traceFilterOptions(graphId: $graphId) {
      clientName
      clientVersion
      schemaTag
      hasErrors
    }
  }
`

export default function TraceFilters({ graphId, isVisible }) {
  const {
    rawFilters: conditions,
    setFilters,
    setFilterInterval,
    filterInterval
  } = useContext(FiltersContext)

  const { loading, error, data } = useQuery(TRACE_FILTER_OPTIONS, {
    variables: {
      graphId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  // Todo we should just have an arbitrary way to select to - from.
  const fields = Object.entries({
    ...data.traceFilterOptions,
    interval: ['hour', 'day', 'month']
  })
    .filter(([k, v]) => {
      if (k === '__typename') {
        return false
      }
      return true
    })
    .map(([k, v]) => {
      return {
        label: k,
        name: k,
        type: 'list',
        operators: ['eq', 'ne'],
        list: v
          ? v
              .filter(v => !!v)
              .map(v => ({
                name: v,
                label: v
              }))
          : []
      }
    })

  if (!isVisible) {
    return <div />
  }

  return (
    <div className={styles.wrapper}>
      <div>
        <VisualFilter
          conditions={conditions}
          fields={fields}
          onChange={data => {
            setFilters(data)
          }}
        />
      </div>
    </div>
  )
}
