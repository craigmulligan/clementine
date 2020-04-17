/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logout from './logout'
import UserContext from './user'
import { FiltersContext } from './trace'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function Menu() {
  const { user } = useContext(UserContext)
  const { rawFilters: filters } = useContext(FiltersContext)
  const location = useLocation()
  const search = new URLSearchParams(location.search)

  console.log(search.toString(), location.pathname)
  let path

  // toggle fitlers query
  if (!search.get('filters')) {
    search.set('filters', '1')
    path = location.pathname + '?' + search.toString()
  } else {
    search.delete('filters')
    path = location.pathname + '?' + search.toString()
  }

  if (user) {
    return (
      <header>
        <nav>
          <Link to="/graph">Graphs</Link>
          <Link to={path}>Filters {filters.length}</Link>
          <Logout />
        </nav>
      </header>
    )
  }

  return (
    <header>
      <nav>
        <div>
          <Link to="/login">signin</Link>
        </div>
      </nav>
    </header>
  )
}

export default Menu
