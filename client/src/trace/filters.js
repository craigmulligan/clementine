import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import VisualFilter from 'react-visual-filter'
import styles from './filters.module.css'
import FiltersContext from './filtersContext'

const TRACE_FILTER_OPTIONS = gql`
  query traceFilterOptions($graphId: ID!) {
    traceFilterOptions(graphId: $graphId) {
      clientName
      clientVersion
      schemaTag
    }
  }
`

export default function TraceFilters({ graphId, onChange }) {
  const { conditions, setFilters } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(TRACE_FILTER_OPTIONS, {
    variables: {
      graphId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  const fields = Object.entries(data.traceFilterOptions)
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

  return (
    <div className={styles.wrapper}>
      <VisualFilter
        conditions={conditions}
        fields={fields}
        dateFormat="Y-M-D"
        onChange={data => {
          setFilters(data)

          if (typeof onChange === 'function') {
            onChange(data)
          }
        }}
      />
    </div>
  )
}
