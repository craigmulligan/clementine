import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { useLocation, Link, useHistory } from 'react-router-dom'
import TracingReponse from './TracingReponse'
import FiltersContext from './filtersContext'
import Source from './source'
import Pill from '../pill'
import styles from './list.module.css'
import Chart from '../timeline/chart'
import { CrossHair, XAxis, YAxis, BarSeries } from '@data-ui/xy-chart'
import { printDuration } from '../utils'
import OrderBy from '../orderby'

const TRACE_LIST = gql`
  query traceList(
    $graphId: ID!
    $operationId: ID!
    $after: String
    $orderBy: TraceOrderBy
    $to: DateTime
    $from: DateTime
    $traceFilters: [TraceFilter]
  ) {
    traces(
      graphId: $graphId
      operationId: $operationId
      after: $after
      orderBy: $orderBy
      traceFilters: $traceFilters
      to: $to
      from: $from
    ) {
      nodes {
        id
        duration
        startTime
        endTime
      }
      cursor
    }
  }
`

export function renderTooltip({ datum, seriesKey, color, data }) {
  const { x, y, value, startTime } = datum

  return (
    <div>
      {seriesKey && (
        <div>
          <strong style={{ color }}>{seriesKey}</strong>
        </div>
      )}
      <div>
        <strong style={{ color }}>TraceId </strong>
        {x}
      </div>
      <div>
        <strong style={{ color }}>Duration </strong>
        {y}
      </div>
      {data && (
        <div>
          <strong style={{ color }}>time </strong>
          {new Date(startTime).toString()}
        </div>
      )}
    </div>
  )
}

export default function TraceList({ graphId, operationId }) {
  const location = useLocation()
  const history = useHistory()
  const [orderField, setOrderField] = useState('duration')
  const [orderAsc, setOrderAsc] = useState(false)
  const { filters, to, from } = useContext(FiltersContext)

  const { loading, error, data } = useQuery(TRACE_LIST, {
    variables: {
      graphId,
      operationId,
      traceFilters: filters,
      to: to,
      from: from,
      orderBy: {
        field: orderField,
        asc: orderAsc
      }
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (data.traces.nodes.length === 0) {
    return <div>Not Found</div>
  }

  const dataSeries = data.traces.nodes.map(d => ({
    startTime: d.startTime,
    label: printDuration(d.duration),
    x: d.id,
    y: d.duration / 1000 / 1000
  }))

  return (
    <main>
      <OrderBy
        fields={[
          { label: 'latency', field: 'duration' },
          { label: 'time', field: 'startTime' }
        ]}
        orderAsc={orderAsc}
        orderField={orderField}
        setOrderAsc={setOrderAsc}
        setOrderField={setOrderField}
      />
      <div>
        <Chart
          ariaLabel="TraceList"
          renderTooltip={renderTooltip}
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear' }}
        >
          <XAxis tickFormat={tick => tick.slice(0, 4) + '...'} label="Traces" />
          <YAxis label="Duration" />
          <BarSeries
            data={dataSeries}
            fill="black"
            onClick={({ datum }) => {
              history.push(`${location}/${datum.x}`)
            }}
          />
          <CrossHair showHorizontalLine={true} fullHeight stroke="orange" />
        </Chart>
      </div>
    </main>
  )
}
