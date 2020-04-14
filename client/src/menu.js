/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import Logout from './logout'
import UserContext from './user'
import { FiltersContext } from './trace'

function Menu() {
  const { user } = useContext(UserContext)
  const { rawFilters: filters } = useContext(FiltersContext)

  if (user) {
    return (
      <header>
        <nav>
          <Link to="/graph">
            <a>Graphs</a>
          </Link>
          <Link to={'?filters=1'}>Filters {filters.length}</Link>
          <Logout />
        </nav>
      </header>
    )
  }

  return (
    <header>
      <nav>
        <div>
          <Link to="/login">
            <a>signin</a>
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default Menu
