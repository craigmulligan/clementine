import React from 'react'
export default function Details({ children }) {
  if (!children.variablesJson) {
    return <div />
  }
  return (
    <div>
      <div><p>Variables:</p></div>
    <pre>
      <code className="code-block">{JSON.stringify(children.variablesJson, null, 2)}</code>
    </pre>
    </div>
  )
}
