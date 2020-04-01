import React from 'react'

function printDuration(nanoSeconds) {
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
      <span>&nbsp;{count}</span>
      <span>&nbsp;{errorCount}</span>
      <span>&nbsp;{errorPercent}%</span>
      <span>
        &nbsp;<code>{printDuration(duration)}</code>
      </span>
    </span>
  )
}
