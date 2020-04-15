import React, { useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import Chart from './chart'
import { CrossHair, XAxis, YAxis, BarSeries } from '@data-ui/xy-chart'
import { FiltersContext } from '../trace'

const LATENCY_DISTRIBUTION = gql`
  query latencyDistribution(
    $graphId: ID!
    $operationId: ID
    $traceFilters: [TraceFilter]
    $to: DateTime
    $from: DateTime
  ) {
    latencyDistribution(
      graphId: $graphId
      operationId: $operationId
      traceFilters: $traceFilters
      to: $to
      from: $from
    ) {
      nodes {
        duration
        count
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
        <strong style={{ color }}>Duration </strong>
        {x.toFixed(2)}
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
  const { loading, error, data } = useQuery(LATENCY_DISTRIBUTION, {
    variables: {
      graphId,
      operationId,
      traceFilters: filters,
      to,
      from
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  const dataCount = data.latencyDistribution.nodes.map(d => ({
    x: d.duration / 1000 / 1000,
    y: d.count
  }))

  return (
    <main>
    <Chart
      ariaLabel="LatencyDistribution"
      xScale={{ type: 'band' }}
      yScale={{ type: 'linear' }}
      snapTooltipToDataX
      renderTooltip={renderTooltip}
    >
      <XAxis tickFormat={tick => tick.toFixed(2)} label="Duration" />
      <YAxis label="Requests" />
      <BarSeries data={dataCount} fill="blue" />
      <CrossHair showHorizontalLine={true} fullHeight stroke="pink" />
    </Chart>
    </main>
  )
}
