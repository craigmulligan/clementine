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

function processFilters(data) {
  return data.map(({ field, operator, value }) => ({
    field,
    operator,
    value
  })).reduce((acc, v) => {
    if (v.field === "interval") {
      const to = Date.now()
      acc.to = to
      if (v.value === 'hour') {
        acc.from = to - (1000 * 60 * 60)
      }

      if (v.value === 'day') {
        acc.from = to - (1000 * 60 * 60 * 24)
      }

      if (v.value === 'month') {
        acc.from = to - (1000 * 60 * 60 * 24 * 30)
      }
    } else {
      acc.filters.push(v)
    }

    return acc
  }, { filters: [], to: null, from: null })
}

export default function TraceFilters({ graphId, onChange }) {
  const { conditions, setFilters, setToFrom } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(TRACE_FILTER_OPTIONS, {
    variables: {
      graphId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  // Todo we should just have an arbitrary way to select to - from.
  const defaultFields = [{
    label: "interval",
    name: "interval",
    operators: ["eq"],
    type: "list",
    list: [{
      label: "Last Month",
      name: "month",
    }, {
      label: "Last Day",
      name: "day"
    }, {
      label: "Last Hour",
      name: "hour"
    }]
  }]

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
        fields={[...defaultFields, ...fields]}
        dateFormat="Y-M-D"
        onChange={data => {
          const { filters, to, from } = processFilters(data)
          setFilters(filters)
          setToFrom({ to, from })

          if (typeof onChange === 'function') {
            onChange(data)
          }
        }}
      />
    </div>
  )
}
