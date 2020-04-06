import React from 'react'

export function ErrorBanner({ error }) {
  return <div>Error: {error.message}</div>
}

export function Loading() {
  return <div>Loading...</div>
}

export function printDuration(nanoSeconds) {
  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}
