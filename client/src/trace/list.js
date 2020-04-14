import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { useLocation, Link } from 'react-router-dom'
import TracingReponse from './TracingReponse'
import Filters from './filters'
import FiltersContext, { FiltersProvider } from './filtersContext'
import Source from './source'
import Pill from '../pill'
import styles from './list.module.css'
import Chart from '../timeline/chart'
import { CrossHair, XAxis, YAxis, BarSeries } from '@data-ui/xy-chart'

const TRACE_LIST = gql`
  query traceList(
    $graphId: ID!
    $operationId: ID!
    $after: String
    $orderBy: TraceOrderBy
  ) {
    traces(
      graphId: $graphId
      operationId: $operationId
      after: $after
      orderBy: $orderBy
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

export default function TraceList({ graphId, operationId }) {
  const [location, setLocation] = useLocation()
  const [orderField, setOrderField] = useState('duration')
  const [orderAsc, setOrderAsc] = useState(false)
  const { loading, error, data } = useQuery(TRACE_LIST, {
    variables: {
      graphId,
      operationId,
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
    label: 'hi',
    x: d.id,
    y: d.duration / 1000 / 1000
  }))

  return (
    <div>
      <Pill
        isActive={true}
        onClick={() => {
          setOrderAsc(prev => !prev)
        }}
      >
        {orderAsc ? 'desc' : 'asc'}
      </Pill>
      <Pill
        isActive={orderField === 'startTime'}
        onClick={() => {
          setOrderField('startTime')
        }}
      >
        Time
      </Pill>
      <Pill
        isActive={orderField === 'duration'}
        onClick={() => {
          setOrderField('duration')
        }}
      >
        Duration
      </Pill>
      <div>
        <Chart
          ariaLabel="TraceList"
          xScale={{ type: 'band' }}
          yScale={{ type: 'linear' }}
        >
          <XAxis label="Traces" />
          <YAxis label="Duration" />
          <BarSeries
            data={dataSeries}
            renderLabel={({ datum, labelProps, index: i }) => {
              console.log(datum)
              return
            }}
            fill="blue"
            onClick={({ datum }) => {
              setLocation(`${location}/${datum.x}`)
            }}
          />
          <CrossHair showHorizontalLine={true} fullHeight stroke="pink" />
        </Chart>
      </div>
    </div>
  )
}
