/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react'
import { Link, useLocation, useRouteMatch } from 'react-router-dom'
import Logout from './logout'
import UserContext from './user'
import { FiltersContext } from './trace'
import Label from './label'

function Menu() {
  const { user } = useContext(UserContext)
  const { rawFilters: filters } = useContext(FiltersContext)
  const location = useLocation()
  const match = useRouteMatch('/graph/:graphId')
  const search = new URLSearchParams(location.search)

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
    const label = filters.length > 0 ? <Label /> : ''
    return (
      <header>
        <nav>
          <Link to="/graph">Graphs</Link>
          {match && <Link to={path}>Filters {label}</Link>}
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
