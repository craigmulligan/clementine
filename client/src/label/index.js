import React from 'react'
import styles from './index.module.css'

export default function Label({ className, type='green', ...props }) {
  console.log({ type })
  return <span {...props} className={styles.label + " " + styles[type]} />
}
