import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import TracingReponse from './TracingReponse'
import Filters from './filters'
import FiltersContext, { FiltersProvider } from './filtersContext'
import Source from './source'
import TraceList from './list'
import Details from './details'
import { printDuration } from '../utils'
import styles from './index.module.css'
import { getOperationName } from '../operation/utils'

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
      <div className={styles.wrapper}>
        <div className={styles.stat}>
          <div className={styles.statNumber}>
            {printDuration(trace.duration)}
          </div>
          <div className={styles.statTitle}>Duration</div>
        </div>
        <h2>{trace.id}</h2>
        <i className={styles.subtitle}>
          {getOperationName(gql(trace.key))} {String.fromCharCode(255)}{' '}
        </i>
        <i className={styles.subtitle}>{trace.startTime.toString()}</i>
      </div>
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
