import * as React from 'react'
import styles from './TracingRow.module.css'

function printDuration(nanoSeconds) {
  const microSeconds = Math.round(nanoSeconds / 1000)
  if (microSeconds > 1000) {
    const ms = Math.round(microSeconds / 1000)
    return `${ms} ms`
  }

  return `${microSeconds} µs`
}

export default function TracingRow(props) {
  const { path, startOffset, duration } = props
  const factor = 1000 * 1000
  const offsetLeft = startOffset / factor
  const barWidth = duration / factor
  return (
    <div
      className={styles.row}
      style={{ transform: `translateX(${offsetLeft}px)` }}
    >
      <span className={styles.wrapper}>
        <span className={styles.name}>
          {path.slice(-2).map((p, index) => (
            <span
              style={{
                opacity: index === path.slice(-2).length - 1 ? 1 : 0.6
              }}
              key={p}
            >
              {`${index > 0 ? '.' : ''}${p}`}
            </span>
          ))}
        </span>
      </span>
      <span className={styles.bar} style={{ width: Math.max(barWidth, 3) }} />
      <span className={styles.duration}>{printDuration(duration)}</span>
    </div>
  )
}
