import React from 'react'
export default function Details({ children }) {
  if (!children.variablesJson) {
    return <div />
  }
  return (
    <pre>
      Variables: <code>{JSON.stringify(children.variablesJson)}</code>
    </pre>
  )
}
