import React from 'react'
import styles from './stats.module.css'

function printDuration(nanoSeconds) {
  if (!nanoSeconds) {
    return ''
  }

  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}

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
