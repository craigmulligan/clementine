import React from 'react'
import { Link, useRoute } from 'wouter'

function ActiveLink({ to, ...props }) {
  const [isActive] = useRoute(to)

  return (
    <Link {...props} to={to}>
      <a href="#" className={isActive ? 'active' : ''}>
        {props.children}
      </a>
    </Link>
  )
}

export default ActiveLink
