import { printDuration } from '../utils'
import styles from './header.module.css'

export default function Header({ title, date, duration }) {
  return (
    <div className={styles.wrapper}>
      <h3>{title}</h3>
      <div className={styles.stat}>
        <div className={styles.statNumber}>{printDuration(duration)}</div>
        <div className={styles.statTitle}>Duration</div>
      </div>
    </div>
  )
}
