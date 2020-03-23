/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { Link } from 'wouter'
import Logout from './logout'
import UserContext from './user'

function Menu() {
  const { user } = useContext(UserContext)

  if (user) {
    return (
      <header>
        <nav>
          <Link to="/dash">
            <a>Dashboard</a>
          </Link>
          <Logout />
        </nav>
      </header>
    )
  }

  return (
    <header>
      <nav>
        <div>
          <Link to="/signup">
            <a>Signup</a>
          </Link>
          <Link to="/login">
            <a>login</a>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Menu
