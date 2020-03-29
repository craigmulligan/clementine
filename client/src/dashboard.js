import React from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import { GraphList, GraphCreate } from './graph'
import { Loading, ErrorBanner } from './utils'

const GET_USER = gql`
  {
    user {
      id
      email
    }
  }
`

function Dashboard() {
  const { loading, error, data } = useQuery(GET_USER)

  if (loading) return <Loading />
  if (error) return <ErrorBanner error={error} />

  if (!data.user) {
    return <div>Not Found</div>
  }

  return (
    <section>
      <div>
        User: {data.user.id} : <mark>{data.user.email}</mark>
        <GraphCreate />
        <GraphList />
      </div>
    </section>
  )
}

export default Dashboard
