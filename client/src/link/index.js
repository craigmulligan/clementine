import React from 'react'
import { NavLink } from 'react-router-dom'

function ActiveLink({ to, ...props }) {
  return (
    <NavLink activeClassName="active" {...props} to={to}>
      {props.children}
    </NavLink>
  )
}

export default ActiveLink
