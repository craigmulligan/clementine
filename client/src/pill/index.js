import React from 'react'
import styles from './index.module.css'

function Pill({ children, isActive, ...props }) {
  const cls = [styles.pill]

  if (isActive) {
    cls.push(styles.active)
  }
  return (
    <span {...props} className={cls.join(' ')}>
      {children}
    </span>
  )
}

export default Pill
