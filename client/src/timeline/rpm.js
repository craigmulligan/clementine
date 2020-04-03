import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import Chart from './chart'
import {
  XYChart,
  CrossHair,
  XAxis,
  YAxis,
  LinearGradient,
  LineSeries,
  PointSeries
} from '@data-ui/xy-chart'

const TRACE_LIST = gql`
  query RPM($graphId: ID!, $operationId: ID, $to: DateTime, $from: DateTime) {
    rpm(graphId: $graphId, operationId: $operationId, to: $to, from: $from) {
      nodes {
        startTime
        count
        errorCount
      }
      cursor
    }
  }
`

export default function TimeLine({ graphId, operationId }) {
  const [to, setTo] = useState(null)
  const [from, setFrom] = useState(null)
  const { loading, error, data } = useQuery(TRACE_LIST, {
    variables: {
      graphId,
      operationId,
      from
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
    <div>
      <button
        onClick={() => {
          const monthMs = 86400000 * 30
          const now = new Date()
          const from = new Date(now - monthMs)
          setFrom(from)
        }}
      >
        Month
      </button>
      <Chart
        ariaLabel="RPM"
        xScale={{ type: 'time' }}
        yScale={{ type: 'linear' }}
        snapTooltipToDataX
      >
        <XAxis label="Time" />
        <YAxis label="Requests" />
        <LineSeries data={dataCount} stroke="blue" />
        <LineSeries data={dataErrorCount} stroke="red" />
        <CrossHair showHorizontalLine={true} fullHeight stroke="pink" />
      </Chart>
    </div>
  )
}
