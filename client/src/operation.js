import React from 'react'

export function OperationList({ operations }) {
  return (
    <ul>
      {operations.map(op => {
        return (
          <li>
            <span>{op.id}</span>
            <span>{op.requests_count}</span>
            <span>{op.duration}</span>
          </li>
        )
      })}
    </ul>
  )
}
