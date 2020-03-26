import React from 'react'
import { gql } from 'apollo-boost'
import { useQuery } from '@apollo/react-hooks'
import { GraphList, GraphCreate } from './graph'

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

  if (loading) return <div>'Loading...'</div>
  if (error) return <div>`Error! ${error.message}`</div>

  if (!data.user) {
    return <div>Not Found</div>
  }

  return (
    <section>
      <aside>
        <GraphList />
      </aside>
      <aside>
        <div>
          User: {data.user.id} : <mark>{data.user.email}</mark>
          <GraphCreate />
        </div>
      </aside>
    </section>
  )
}

export default Dashboard
