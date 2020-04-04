import { gql } from 'apollo-boost'
import React, { useRef, useContext } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useLocation, Link } from 'wouter'
import { KeyList, KeyCreate } from './key'
import KeyMetics from './keyMetrics'
import { ErrorBanner, Loading } from './utils'
import { cloneDeep } from 'lodash'
import { FiltersContext } from './trace'

const GET_GRAPHS = gql`
  query GRAPH_LIST {
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

  return (
    <div>
      <p>Graph list</p>
      <Link to={'/graph/create'}>
        <button>Create Graph</button>
      </Link>
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
  mutation CREATE_GRAPH($name: String!) {
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
              },
              update: (cache, { data: { graphCreate } }) => {
                const prevData = cache.readQuery({
                  query: GET_GRAPHS
                })

                // cloneDeep is necessary for the cache to pickup the change
                // and have the observable components rerender
                const data = cloneDeep(prevData)
                data.user.graphs.push(graphCreate)

                cache.writeQuery({
                  query: GET_GRAPHS,
                  data
                })
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
  query GRAPH_SHOW($graphId: ID!, $traceFilters: [TraceFilter]) {
    graph(graphId: $graphId) {
      id
      name
      keyMetrics(traceFilters: $traceFilters) {
        count
        duration
        errorCount
        errorPercent
      }
    }
  }
`

export function GraphHeader({ graphId }) {
  const { filters } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(SHOW_GRAPH, {
    variables: { graphId, traceFilters: filters }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.graph) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <header>
        <h2>{data.graph.name}</h2>
        <div>
          <KeyMetics {...data.graph.keyMetrics} />
        </div>
      </header>
      <hr />
    </div>
  )
}

export function GraphShow({ graphId }) {
  return (
    <div>
      <Link to={`/graph/${graphId}/settings`}>Settings</Link>
      <ul>
        <Link to={`/graph/${graphId}/operation`}>
          <li>
            <h4>Operations</h4>
            <small>
              Slice you data by operation and find low hanging fruit
            </small>
          </li>
        </Link>
        <Link to={`/graph/${graphId}/rpm`}>
          <li>
            <h4>RPM</h4>
            <small>Get a feel for your traffic over time</small>
          </li>
        </Link>
        <Link to={`/graph/${graphId}/ld`}>
          <li>
            <h4>Latency Distribution</h4>
            <small>What it says on the tin</small>
          </li>
        </Link>
      </ul>
    </div>
  )
}

export const GRAPH_SETTINGS = gql`
  query GRAPH_SETTINGS($graphId: ID!) {
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

      <KeyList keys={data.graph.keys} />
    </div>
  )
}
