import React from 'react'

export function ErrorBanner({ error }) {
  return <div>Error: {error.message}</div>
}

export function Loading() {
  return <div>Loading...</div>
}
