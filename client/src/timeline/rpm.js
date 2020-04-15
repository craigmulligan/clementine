import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import Chart from './chart'
import { CrossHair, XAxis, YAxis, LineSeries } from '@data-ui/xy-chart'
import { FiltersContext } from '../trace'

const TRACE_LIST = gql`
  query RPM(
    $graphId: ID!
    $operationId: ID
    $to: DateTime
    $from: DateTime
    $traceFilters: [TraceFilter]
  ) {
    rpm(
      graphId: $graphId
      operationId: $operationId
      to: $to
      from: $from
      traceFilters: $traceFilters
    ) {
      nodes {
        startTime
        count
        errorCount
      }
      cursor
    }
  }
`

export function renderTooltip({ datum, seriesKey, color, data }) {
  const { x, y, value } = datum

  return (
    <div>
      {seriesKey && (
        <div>
          <strong style={{ color }}>{seriesKey}</strong>
        </div>
      )}
      <div>
        <strong style={{ color }}>Time </strong>
        {new Date(x).toString()}
      </div>
      <div>
        <strong style={{ color }}>Requests </strong>
        {y}
      </div>
    </div>
  )
}

export default function TimeLine({ graphId, operationId }) {
  const { filters, to, from } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(TRACE_LIST, {
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

  const dataCount = data.rpm.nodes.map(d => ({
    x: Date.parse(d.startTime),
    y: d.count
  }))

  const dataErrorCount = data.rpm.nodes.map(d => ({
    x: Date.parse(d.startTime),
    y: d.errorCount
  }))

  return (
    <main>
      <Chart
        ariaLabel="RPM"
        xScale={{ type: 'time' }}
        yScale={{ type: 'linear' }}
        renderTooltip={renderTooltip}
      >
        <XAxis label="Time" />
        <YAxis label="Requests" />
        <LineSeries data={dataCount} strokeWidth={3} stroke="blue" />
        <LineSeries data={dataErrorCount} strokeWidth={3} stroke="red" />
        <CrossHair showHorizontalLine={true} fullHeight stroke="pink" />
      </Chart>
    </main>
  )
}
