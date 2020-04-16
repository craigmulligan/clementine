import React, { useRef, useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useLocation } from 'react-router-dom'
import { gql } from 'apollo-boost'
import client from '../client'
import UserContext from '../user'
import { Header } from '../header'

const LOGIN = gql`
  mutation login($email: String!) {
    userLogin(email: $email)
  }
`

export function Login() {
  const [, setLocation] = useLocation()
  const { setUser } = useContext(UserContext)
  const emailRef = useRef()
  const [login] = useMutation(LOGIN)

  return (
    <div className="center">
      <Header />
      <form
        className="form-inline center"
        onSubmit={async e => {
          e.preventDefault()
          try {
            const user = await login({
              variables: {
                email: emailRef.current.value
              }
            })

            await client.resetStore()
            setLocation('/magic')
          } catch (e) {
            alert(e.message)
          }
        }}
      >
        <input type="email" ref={emailRef} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export function CheckEmail() {
  return (
    <div>
      <Header />
      <p>Check you inbox</p>
      <p>
        No email? <Link to="/login">Try again</Link>
      </p>
    </div>
  )
}
