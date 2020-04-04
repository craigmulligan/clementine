import React from 'react'

function printDuration(nanoSeconds) {
  if (!nanoSeconds) {
    return ''
  }

  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}

export default function keyMetrics({
  count,
  errorCount,
  errorPercent,
  duration
}) {
  return (
    <span>
      <span>Total: &nbsp;{count}</span>
      <span>&nbsp;Total Errors: {errorCount}</span>
      <span>&nbsp;Error Rate: &nbsp;{errorPercent}%</span>
      <span>
        &nbsp;95p <code>{printDuration(duration)}</code>
      </span>
    </span>
  )
}
