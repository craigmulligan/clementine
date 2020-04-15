import * as React from 'react'
import styles from './TracingRow.module.css'
import { printDuration } from '../utils'

export default function TracingRow({
  path,
  startOffset,
  duration,
  totalDuration,
  screenWidth
}) {
  console.log(screenWidth)
  const offsetLeft = (startOffset / totalDuration) * screenWidth
  const barWidth = (duration / totalDuration) * screenWidth

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
