import React from 'react'
import { print } from 'graphql/language/printer'
import { gql } from 'apollo-boost'

export default function Source({ children }) {
  return (
    <div>
      <pre>
        <code>
          {print(
            gql`
              ${children}
            `
          )}
        </code>
      </pre>
    </div>
  )
}
