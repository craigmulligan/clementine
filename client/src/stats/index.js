import React from 'react'
import styles from './index.module.css'
import { printDuration } from '../utils'

export default function keyMetrics({
  count,
  errorCount,
  errorPercent,
  duration
}) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.stat}>
        <div className={styles.statNumber}>{count}</div>
        <div className={styles.statTitle}>Requests</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.statNumber}>{errorCount}</div>
        <div className={styles.statTitle}>Errors</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.statNumber}>{errorPercent}%</div>
        <div className={styles.statTitle}>Error Rate</div>
      </div>
      <div className={styles.stat}>
        <div className={styles.statNumber}>{printDuration(duration) || 0}</div>
        <div className={styles.statTitle}>95 percentile</div>
      </div>
    </div>
  )
}
