import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { GRAPH_SETTINGS } from './graph'
import { cloneDeep } from 'lodash'

const QUERY = gql`
  mutation createApiKey($graphId: ID!) {
    keyCreate(graphId: $graphId) {
      id
      secret
      prefix
    }
  }
`

const REVOKE_QUERY = gql`
  mutation revokeApiKey($keyId: ID!) {
    keyRevoke(keyId: $keyId)
  }
`

export function KeyCreate({ graphId }) {
  const [createKey] = useMutation(QUERY)

  return (
    <button
      onClick={async () => {
        await createKey({
          variables: { graphId },
          update: (cache, { data: { keyCreate } }) => {
            const prevData = cache.readQuery({
              query: GRAPH_SETTINGS,
              variables: { graphId }
            })

            // cloneDeep is necessary for the cache to pickup the change
            // and have the observable components rerender
            const data = cloneDeep(prevData)
            data.graph.keys.push(keyCreate)

            cache.writeQuery({
              query: GRAPH_SETTINGS,
              variables: { graphId },
              data
            })
          }
        })
      }}
    >
      Create API Key
    </button>
  )
}

export function KeyRevoke({ graphId, keyId }) {
  const [revokeKey] = useMutation(REVOKE_QUERY)

  return (
    <button
      onClick={async () => {
        await revokeKey({
          variables: { keyId },
          update: (cache, { data: { keyRevoke } }) => {
            const prevData = cache.readQuery({
              query: GRAPH_SETTINGS,
              variables: { graphId }
            })

            const data = cloneDeep(prevData)
            data.graph.keys = data.graph.keys.filter(key => {
              return key.id !== keyId
            })

            cache.writeQuery({
              query: GRAPH_SETTINGS,
              variables: { graphId },
              data
            })
          }
        })
      }}
    >
      revoke
    </button>
  )
}

export function KeyList({ keys, graphId }) {
  return (
    <ul>
      {keys.map(key => {
        return (
          <li key={key.id}>
            <span>
              {key.secret && (
                <span>
                  Save your key now - you wont be able to retrieve it later.
                </span>
              )}
              {key.secret ? key.secret : key.prefix + '...'}
              <KeyRevoke keyId={key.id} graphId={graphId} />
            </span>
          </li>
        )
      })}
    </ul>
  )
}
