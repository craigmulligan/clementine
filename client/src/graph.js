import { gql } from 'apollo-boost'
import React, { useRef, useContext } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useLocation, Link } from 'wouter'

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

  if (loading) return <div>'Loading...'</div>
  if (error) return <div>`Error! ${error.message}`</div>

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
      keys {
        secret
        id
      }
    }
  }
`

export function GraphShow({ graphId }) {
  const { loading, error, data } = useQuery(SHOW_GRAPH, {
    variables: { graphId }
  })

  if (loading) return <div>'Loading...'</div>
  if (error) return <div>`Error! ${error.message}`</div>

  if (!data.graph) {
    return <div>Not Found</div>
  }

  return (
    <div>
      <h2>{data.graph.name}</h2>
      <p>API Keys</p>
      <ul>
        {data.graph.keys.map(key => {
          return (
            <li key={key.id}>
              <Link to={`/graph/${key.id}`}>{key.secret}</Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
