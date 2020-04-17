import React from 'react'
import styles from './index.module.css'
import Link from '../link'
import { useRoute } from 'wouter'

export default ({ items }) => {
  return (
    <div className={styles.decorator}>
      <main className={styles.container}>
        <div className={styles.wrapper}>
          {items.map(item => {
            const [isActive] = useRoute(item.to)
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
