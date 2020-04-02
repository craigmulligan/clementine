import React from 'react'
import { Group } from '@vx/group'
import { Circle } from '@vx/shape'
import { GradientPinkRed } from '@vx/gradient'
import { scaleLinear, scaleUtc } from '@vx/scale'
import { withTooltip, Tooltip } from '@vx/tooltip'

const x = d => Date.parse(d.startTime)
const y = d => d.duration
const z = d => d.duration

let tooltipTimeout

export default withTooltip(props => {
  const { width, height, points } = props

  const xMax = width
  const yMax = height - 80

  const orderedX = points
    .map(p => p.startTime)
    .sort((a, b) => {
      return Date.parse(a) > Date.parse(b)
    })
    .map(Date.parse)

  const orderedY = points
    .map(p => p.duration)
    .sort((a, b) => {
      return a > b
    })

  const xScale = scaleUtc({
    range: [0, width],
    domain: [orderedX.shift(), orderedX.pop()],
    clamp: true
  })

  console.log(xScale)

  const yScale = scaleLinear({
    domain: [orderedY.shift(), orderedY.pop()],
    range: [0, yMax],
    clamp: true
  })

  return (
    <div>
      <svg width={width} height={height}>
        <GradientPinkRed id="pink" />
        <rect width={width} height={height} rx={14} fill={'url(#pink)'} />
        <Group
          onTouchStart={event => {
            if (tooltipTimeout) clearTimeout(tooltipTimeout)
            props.hideTooltip()
          }}
        >
          {points.map((point, i) => {
            const cx = xScale(x(point))
            console.log(cx, x(point))
            const cy = yScale(y(point))
            const r = i % 3 === 0 ? 2 : 2.765
            return (
              <Circle
                key={`point-${point.x}-${i}`}
                className="dot"
                cx={cx}
                cy={cy}
                r={r}
                fill="#f6c431"
                onMouseEnter={event => {
                  if (tooltipTimeout) clearTimeout(tooltipTimeout)
                  props.showTooltip({
                    tooltipLeft: cx,
                    tooltipTop: cy + 20,
                    tooltipData: point
                  })
                }}
                onMouseLeave={event => {
                  tooltipTimeout = setTimeout(() => {
                    props.hideTooltip()
                  }, 300)
                }}
                onTouchStart={event => {
                  if (tooltipTimeout) clearTimeout(tooltipTimeout)
                  props.showTooltip({
                    tooltipLeft: cx,
                    tooltipTop: cy - 30,
                    tooltipData: point
                  })
                }}
              />
            )
          })}
        </Group>
      </svg>
      {props.tooltipOpen && (
        <Tooltip left={props.tooltipLeft} top={props.tooltipTop}>
          <div>
            <strong>x:</strong> {x(props.tooltipData)}
          </div>
          <div>
            <strong>y:</strong> {y(props.tooltipData)}
          </div>
        </Tooltip>
      )}
    </div>
  )
})
