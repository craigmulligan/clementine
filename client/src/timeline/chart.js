/* eslint react/prop-types: 0 */
import React from 'react'
import { XYChart, theme, withScreenSize, withTheme } from '@data-ui/xy-chart'

// test that withTheme works
const XYChartWithTheme = withTheme(theme)(XYChart)

// this is a little messy to handle all cases across series types
export function renderTooltip({ datum, seriesKey, color, data }) {
  const { x, x0, y, value } = datum
  let xVal = x || x0
  if (typeof xVal === 'string') {
    // noop
  } else if (typeof xVal !== 'string' && Number(xVal) > 1000000) {
    xVal = new Date(xVal).toUTCString()
  }
  const yVal =
    seriesKey && datum[seriesKey] ? datum[seriesKey] : y || value || '--'

  return (
    <div>
      {seriesKey && (
        <div>
          <strong style={{ color }}>{seriesKey}</strong>
        </div>
      )}
      <div>
        <strong style={{ color }}>x </strong>
        {xVal && xVal.toFixed ? xVal.toFixed(2) : xVal}
      </div>
      <div>
        <strong style={{ color }}>y </strong>
        {yVal && yVal.toFixed ? yVal.toFixed(2) : yVal}
      </div>
      {data && (
        <div>
          <strong style={{ color }}>index </strong>
          {data.indexOf(datum)}
        </div>
      )}
    </div>
  )
}

function ResponsiveXYChart({ screenWidth, children, ...rest }) {
  return (
    <XYChartWithTheme
      width={Math.min(700, screenWidth / 1.5)}
      height={Math.min(700 / 2, screenWidth / 1.5 / 2)}
      renderTooltip={renderTooltip}
      {...rest}
    >
      {children}
    </XYChartWithTheme>
  )
}

export default withScreenSize(ResponsiveXYChart)
