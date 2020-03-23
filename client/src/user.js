import React, { Component, useContext } from 'react'
import { gql } from 'apollo-boost'
import { Redirect } from 'wouter'
import client from './client'

const GET_USER = gql`
  {
    user {
      id
      email
    }
  }
`

const UserContext = React.createContext()

class UserProvider extends Component {
  // Context state
  state = {
    user: {}
  }

  // Method to update state
  setUser = user => {
    this.setState(prevState => ({ user }))
  }

  componentDidMount = async () => {
    const {
      data: { user }
    } = await client.query({ query: GET_USER })
    this.setUser(user)
  }

  render() {
    const { children } = this.props
    const { user } = this.state
    const { setUser } = this

    return (
      <UserContext.Provider
        value={{
          user,
          setUser
        }}
      >
        {children}
      </UserContext.Provider>
    )
  }
}

export { UserProvider }

export default UserContext

export function UserRedirect({ children }) {
  const { user } = useContext(UserContext)

  if (!user) {
    return <Redirect to="/login" />
  }

  return children
}
