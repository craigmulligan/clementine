import { gql } from 'apollo-boost'
import React, { useRef, useContext } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import { cloneDeep } from 'lodash'
import { FiltersContext } from '../trace'
import { ErrorBanner, Loading, NotFound } from '../utils'
import Nav from '../nav'
import { KeyList, KeyCreate } from '../key'
import Stats from '../stats'
import graphListStyles from './graph-list.module.css'

const GET_GRAPHS = gql`
  query GRAPH_LIST(
    $traceFilters: [TraceFilter]
    $to: DateTime
    $from: DateTime
  ) {
    user {
      id
      graphs {
        id
        name
        stats(to: $to, from: $from, traceFilters: $traceFilters) {
          errorCount
          errorPercent
          count
          duration
        }
      }
    }
  }
`

export function GraphList() {
  const { filters, from, to } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(GET_GRAPHS, {
    variables: {
      traceFilters: filters,
      to,
      from
    }
  })

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.user) {
    return <div>Not Found</div>
  }

  return (
    <main>
      <GraphCreate />
      <div className={graphListStyles.wrapper}>
        {data.user.graphs.length > 0 ? (
          data.user.graphs.map(graph => {
            return (
              <Link key={graph.id} to={`/graph/${graph.id}/operation`}>
                <div className={graphListStyles.row}>
                  {graph.name}
                  <Stats {...graph.stats} />
                </div>
              </Link>
            )
          })
        ) : (
          <NotFound />
        )}
      </div>
    </main>
  )
}

const GRAPH_CREATE = gql`
  mutation CREATE_GRAPH(
    $name: String!
    $traceFilters: [TraceFilter]
    $to: DateTime
    $from: DateTime
  ) {
    graphCreate(name: $name) {
      id
      name
      stats(to: $to, from: $from, traceFilters: $traceFilters) {
        errorCount
        errorPercent
        count
        duration
      }
    }
  }
`

export function GraphCreate() {
  const { filters, from, to } = useContext(FiltersContext)
  const nameRef = useRef()
  const [gc] = useMutation(GRAPH_CREATE)

  return (
    <div>
      <form
        className="form-inline"
        onSubmit={async e => {
          e.preventDefault()
          try {
            await gc({
              variables: {
                name: nameRef.current.value,
                traceFilters: filters,
                to,
                from
              },
              update: (cache, { data: { graphCreate } }) => {
                const prevData = cache.readQuery({
                  query: GET_GRAPHS,
                  variables: {
                    traceFilters: filters,
                    to,
                    from
                  }
                })

                // cloneDeep is necessary for the cache to pickup the change
                // and have the observable components rerender
                const data = cloneDeep(prevData)
                if (!data.user.graphs) {
                  data.user.graphs = []
                }
                data.user.graphs.push(graphCreate)

                cache.writeQuery({
                  query: GET_GRAPHS,
                  variables: {
                    traceFilters: filters,
                    to,
                    from
                  },
                  data
                })

                // clear form on success
                nameRef.current.value = ''
              }
            })
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
  query GRAPH_SHOW(
    $graphId: ID!
    $traceFilters: [TraceFilter]
    $from: DateTime
    $to: DateTime
  ) {
    graph(graphId: $graphId) {
      id
      name
      stats(traceFilters: $traceFilters, from: $from, to: $to) {
        count
        duration
        errorCount
        errorPercent
      }
    }
  }
`

export function GraphHeader({ graphId }) {
  const { filters, from, to } = useContext(FiltersContext)
  const { loading, error, data } = useQuery(SHOW_GRAPH, {
    variables: { graphId, traceFilters: filters, from, to }
  })

  const items = [
    {
      to: `/graph/${graphId}/operation`,
      title: 'Operations'
    },
    {
      to: `/graph/${graphId}/rpm`,
      title: 'Requests over time'
    },
    {
      to: `/graph/${graphId}/ld`,
      title: 'Latency Distribution'
    },
    {
      to: `/graph/${graphId}/settings`,
      title: 'Settings'
    }
  ]

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.graph) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <main>
        <header>
          <h2>{data.graph.name}</h2>
          <div>
            <Stats {...data.graph.stats} />
          </div>
        </header>
      </main>
      <Nav items={items} />
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
    return <NotFound />
  }

  return (
    <main>
      <h4>API Keys</h4>
      <KeyCreate graphId={data.graph.id} />
      <KeyList graphId={data.graph.id} keys={data.graph.keys} />
    </main>
  )
}
