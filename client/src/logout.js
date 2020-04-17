import React, { useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import client from './client'
import UserContext from './user'
import { Link } from 'react-router-dom'

const LOGOUT = gql`
  mutation logut {
    userLogout
  }
`

export default function Logout() {
  const { setUser } = useContext(UserContext)
  const [logout] = useMutation(LOGOUT)

  return (
    <Link
      to="/login"
      onClick={async () => {
        await logout()
        client.resetStore()
        setUser(null)
      }}
    >
      Logout
    </Link>
  )
}
