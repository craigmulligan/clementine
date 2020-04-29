import React from 'react'

export function ErrorBanner({ error }) {
  return <div style={{ textAlign: 'center' }}>Error: {error.message}...</div>
}

export function Loading() {
  return <div style={{ textAlign: 'center' }}>Loading...</div>
}

export function NotFound() {
  return <div style={{ textAlign: 'center' }}>Not Found</div>
}

export function printDuration(nanoSeconds) {
  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}

export function printDate(d) {
  return (
    d.getFullYear() +
    '-' +
    (d.getMonth() + 1) +
    '-' +
    d.getDate() +
    ' ' +
    d.getHours() +
    ':' +
    d.getMinutes() +
    ':' +
    d.getSeconds()
  )
}
