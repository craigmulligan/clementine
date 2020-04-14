import React, { Component, useContext } from 'react'
import { gql } from 'apollo-boost'
import { Redirect } from 'react-router-dom'
import client from './client'
import logger from 'loglevel'

const GET_USER = gql`
  {
    user {
      id
      email
      createdAt
    }
  }
`

const VERIFY_TOKEN = gql`
  mutation tokenVerify($token: String) {
    tokenVerify(token: $token) {
      id
      email
      createdAt
    }
  }
`

const UserContext = React.createContext()

class UserProvider extends Component {
  state = {
    user: {}
  }

  setUser = user => {
    this.setState(prevState => ({ user }))
  }

  componentDidMount = async () => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')

    if (token) {
      try {
        const {
          data: { tokenVerify: user }
        } = await client.mutate({
          mutation: VERIFY_TOKEN,
          variables: { token }
        })

        this.setUser(user)
      } catch (e) {
        logger.error(e)
        logger.warn('could find current user')
      }
    }

    try {
      const {
        data: { user }
      } = await client.query({ query: GET_USER })
      this.setUser(user)
    } catch (e) {
      logger.warn('could find current user')
    }
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
