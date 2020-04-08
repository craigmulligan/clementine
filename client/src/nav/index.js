import React from 'react'
import styles from './index.module.css'
import Link from '../link'

export default ({ items }) => {
  return (
    <div className={styles.wrapper}>
      {items.map(item => {
        return (
          <Link key={item.to} to={item.to}>
            <div className={styles.item}>{item.title}</div>
          </Link>
        )
      })}
    </div>
  )
}
