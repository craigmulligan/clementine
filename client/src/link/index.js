import React from 'react'
import { Link } from 'react-router-dom'

function ActiveLink({ to, ...props }) {
  const isActive = false
  return (
    <Link className={isActive ? 'active' : ''} {...props} to={to}>
      {props.children}
    </Link>
  )
}

export default ActiveLink
