import * as React from 'react'
import TracingRow from './TracingRow'
import { withParentSize } from '@data-ui/xy-chart'
import styles from './TracingResponse.module.css'

function prepareTracing(node, acc = []) {
  if (node.child.length === 0) {
    return acc
  }

  for (const child of node.child) {
    if ((child.parentType, child.responseName)) {
      acc.push({
        startTime: child.startTime,
        endTime: child.endTime,
        path: [child.parentType, child.responseName]
      })
    }

    // recurse
    prepareTracing(child, acc)
  }

  return acc
}

export default withParentSize(({ parentWidth, tracing, duration }) => {
  return (
    <div className={styles.wrapper}>
      <div>
        <TracingRow
          path={['Operation']}
          startOffset={0}
          duration={duration}
          totalDuration={duration}
          screenWidth={parentWidth * 0.85}
        />
        {prepareTracing(tracing).map((res, i) => (
          <TracingRow
            key={[i, ...res.path].join('.')}
            path={res.path}
            startOffset={res.startTime}
            duration={res.endTime - res.startTime}
            totalDuration={duration}
            screenWidth={parentWidth * 0.85}
          />
        ))}
      </div>
    </div>
  )
})
