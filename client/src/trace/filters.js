import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import VisualFilter from 'react-visual-filter'
import styles from './filters.module.css'
import FiltersContext from './filtersContext'
import { useLocation } from 'wouter'

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

export default function TraceFilters({ graphId, onChange }) {
  const {
    rawFilters: conditions,
    setFilters,
    setFilterInterval,
    filterInterval
  } = useContext(FiltersContext)
  const [location, set, query] = useLocation()
  const url = new URL('http://localhost' + location)

  const params = url.searchParams

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

  console.log(params.get('filters'))
  if (!params.get('filters')) {
    return <div />
  }

  return (
    <div className={styles.wrapper}>
      <VisualFilter
        conditions={conditions}
        fields={fields}
        onChange={data => {
          setFilters(data)
        }}
      />
    </div>
  )
}
