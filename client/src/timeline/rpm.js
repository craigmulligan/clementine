import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import ScatterPlot from './scatterplot'
import {
  PatternLines,
  Sparkline,
  BarSeries,
  WithTooltip,
  LineSeries,
  PointSeries,
  VerticalReferenceLine
} from '@data-ui/sparkline'

const renderTooltip = (
  { datum } // eslint-disable-line react/prop-types
) => (
  <div>
    {datum.count && <div>{datum.count}</div>}
    <div>{datum.y ? datum.startTime : '--'}</div>
  </div>
)

const renderLabel = d => <div>{d.startTime}</div>

const TRACE_LIST = gql`
  query RPM($graphId: ID!) {
    rpm(graphId: $graphId) {
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
  const { loading, error, data } = useQuery(TRACE_LIST, {
    variables: {
      graphId
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  return (
    <WithTooltip renderTooltip={renderTooltip}>
      {({ onMouseMove, onMouseLeave, tooltipData }) => (
        <Sparkline
          ariaLabel="Latency Distribution"
          width={500}
          height={100}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          data={data.rpm.nodes}
          valueAccessor={d => d.count}
        >
          <PatternLines
            id="area_pattern"
            height={4}
            width={4}
            strokeWidth={1}
            orientation={['diagonal']}
            stroke={'black'}
          />
          <LineSeries showArea fill="url(#area_pattern)" />
          <PointSeries points={['all']} fill="#fff" size={3} />
          <PointSeries
            points={['last']}
            renderLabel={renderLabel}
            labelPosition="right"
          />
          {tooltipData && [
            <VerticalReferenceLine
              key="ref-line"
              strokeWidth={1}
              reference={tooltipData.index}
              strokeDasharray="4 4"
            />,
            <PointSeries key="ref-point" points={[tooltipData.index]} />
          ]}
        </Sparkline>
      )}
    </WithTooltip>
  )
}
