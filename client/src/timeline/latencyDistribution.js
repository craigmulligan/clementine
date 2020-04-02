import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { Loading, ErrorBanner } from '../utils'
import { Link } from 'wouter'
import ScatterPlot from './scatterplot'
import { Sparkline, BarSeries, WithTooltip } from '@data-ui/sparkline'

function printDuration(nanoSeconds) {
  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}

const TRACE_LIST = gql`
  query latencyDistribution($graphId: ID!) {
    latencyDistribution(graphId: $graphId) {
      nodes {
        duration
        count
      }
      cursor
    }
  }
`

const renderTooltip = (
  { datum } // eslint-disable-line react/prop-types
) => (
  <div>
    {datum.count && <div>{datum.count}</div>}
    <div>{datum.duration ? printDuration(datum.duration) : '--'}</div>
  </div>
)

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
          height={200}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
          data={data.latencyDistribution.nodes}
          valueAccessor={d => d.count}
        >
          <BarSeries
            fillOpacity={0.8}
            renderLabel={(d, i) => {
              const indexToHighlight = tooltipData ? tooltipData.index : 5

              return i === indexToHighlight ? '🤔' : null
            }}
          />
        </Sparkline>
      )}
    </WithTooltip>
  )
}
