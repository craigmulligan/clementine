import { gql } from 'apollo-boost'
import React, { useRef } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useLocation, Link } from 'wouter'
import { OperationList } from './operation'
import { KeyList, KeyCreate } from './key'
import { ErrorBanner, Loading } from './utils'

const GET_GRAPHS = gql`
  {
    user {
      id
      graphs {
        id
        name
      }
    }
  }
`

export function GraphList() {
  const { loading, error, data } = useQuery(GET_GRAPHS)

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.user.graphs) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <p>Graph list</p>
      <ul>
        {data.user.graphs.map(graph => {
          return (
            <li key={graph.id}>
              <Link to={`/graph/${graph.id}`}>{graph.name}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const GRAPH_CREATE = gql`
  mutation login($name: String!) {
    graphCreate(name: $name) {
      id
      name
    }
  }
`

export function GraphCreate() {
  const nameRef = useRef()
  const [gc] = useMutation(GRAPH_CREATE)
  const [, setLocation] = useLocation()

  return (
    <div>
      <form
        onSubmit={async e => {
          e.preventDefault()
          try {
            const {
              data: { graphCreate: graph }
            } = await gc({
              variables: {
                name: nameRef.current.value
              }
            })

            setLocation(`/graph/${graph.id}`)
          } catch (e) {
            alert(e.message)
          }
        }}
      >
        <input type="text" ref={nameRef} />
        <button type="submit">Create Graph</button>
      </form>
    </div>
  )
}

const SHOW_GRAPH = gql`
  query showGraph($graphId: ID!) {
    graph(graphId: $graphId) {
      id
      name
    }
  }
`

export function GraphShow({ graphId }) {
  const { loading, error, data } = useQuery(SHOW_GRAPH, {
    variables: { graphId }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.graph) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <h2>{data.graph.name}</h2>
      <Link to={`/graph/${data.graph.id}/settings`}>Settings</Link>
      <OperationList graphId={data.graph.id} />
    </div>
  )
}

export const GRAPH_SETTINGS = gql`
  query showGraph($graphId: ID!) {
    graph(graphId: $graphId) {
      id
      name
      keys {
        id
        secret
      }
    }
  }
`

export function GraphSettings({ graphId }) {
  const { loading, error, data } = useQuery(GRAPH_SETTINGS, {
    variables: { graphId }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.graph) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <h2>{data.graph.name}</h2>
      <p>API Keys</p>
      <KeyCreate graphId={data.graph.id} />
      <KeyList keys={data.graph.keys} />
    </div>
  )
}
