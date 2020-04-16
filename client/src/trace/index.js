import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'react-router-dom'
import TracingReponse from './TracingReponse'
import Filters from './filters'
import FiltersContext, { FiltersProvider } from './filtersContext'
import Source from './source'
import TraceList from './list'
import Details from './details'

const TRACE_SHOW = gql`
  query trace($traceId: ID!) {
    trace(traceId: $traceId) {
      id
      key
      duration
      startTime
      endTime
      root
      details
    }
  }
`

export function TraceShow({ traceId }) {
  const { loading, error, data } = useQuery(TRACE_SHOW, {
    variables: {
      traceId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  const { trace } = data

  if (!trace) {
    return <div>Not Found</div>
  }

  return (
    <main>
      <h2>
        {trace.id} - {trace.startTime} - {trace.duration}
      </h2>
      <details>
        <summary>View Query</summary>
        <Source>{trace.key}</Source>
        <Details>{trace.details}</Details>
      </details>
      <TracingReponse
        tracing={trace.root}
        duration={trace.duration}
        startTime={trace.startTime}
      />
    </main>
  )
}

export { Filters, FiltersProvider, FiltersContext, TraceList }
