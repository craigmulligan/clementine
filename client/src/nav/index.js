import React from 'react'
import styles from './index.module.css'
import Link from '../link'

export default ({ items }) => {
  const isActive = false
  return (
    <div className={styles.decorator}>
      <main className={styles.container}>
        <div className={styles.wrapper}>
          {items.map(item => {
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  isActive ? styles.link + ' ' + styles.active : styles.link
                }
              >
                <div className={styles.item}>{item.title}</div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
