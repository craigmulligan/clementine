import React, { useRef, useContext } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { useLocation } from 'react-router-dom'
import { gql } from 'apollo-boost'
import client from './client'
import UserContext from './user'
import { Header } from './header'

const SIGNUP = gql`
  mutation signup($email: String!, $password: String!) {
    userCreate(email: $email, password: $password) {
      id
      email
    }
  }
`

export function Signup() {
  const [, setLocation] = useLocation()
  const { setUser } = useContext(UserContext)
  const emailRef = useRef()
  const passwordRef = useRef()

  const [signup] = useMutation(SIGNUP)

  return (
    <div>
      <Header />
      <form
        onSubmit={async e => {
          e.preventDefault()
          try {
            const user = await signup({
              variables: {
                email: emailRef.current.value,
                password: passwordRef.current.value
              }
            })

            setUser(user)
            setLocation('/graph')
          } catch (e) {
            // alert(e.message)
            console.log(e)
          }
        }}
      >
        <input type="email" ref={emailRef} />
        <input type="password" ref={passwordRef} />
        <button type="submit">Signup</button>
      </form>
    </div>
  )
}

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
      email
      id
    }
  }
`

export function Login() {
  const [, setLocation] = useLocation()
  const { setUser } = useContext(UserContext)
  const emailRef = useRef()
  const passwordRef = useRef()

  const [login] = useMutation(LOGIN)

  return (
    <div>
      <Header />
      <form
        onSubmit={async e => {
          e.preventDefault()
          try {
            const user = await login({
              variables: {
                email: emailRef.current.value,
                password: passwordRef.current.value
              }
            })

            await client.resetStore()
            setUser(user)
            setLocation('/graph')
          } catch (e) {
            alert(e.message)
          }
        }}
      >
        <input type="email" ref={emailRef} />
        <input type="password" ref={passwordRef} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
