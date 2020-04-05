/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { Link } from 'wouter'
import Logout from './logout'
import UserContext from './user'
import { FiltersContext } from './trace'

function Menu() {
  const { user } = useContext(UserContext)
  const { toggleVisibility, filters } = useContext(FiltersContext)

  if (user) {
    return (
      <header>
        <nav>
          <Link to="/graph">
            <a>Dashboard</a>
          </Link>
          <a onClick={toggleVisibility}>Filters {filters.length}</a>
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
