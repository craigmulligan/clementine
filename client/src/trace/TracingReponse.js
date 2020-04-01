import * as React from 'react'
import TracingRow from './TracingRow'
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

export default class ResponseTracing extends React.PureComponent {
  render() {
    const { tracing, duration } = this.props

    return (
      <div className={styles.wrapper}>
        <div>
          <TracingRow
            path={['Operation']}
            startOffset={0}
            duration={duration}
          />
          {prepareTracing(tracing).map((res, i) => (
            <TracingRow
              key={[i, ...res.path].join('.')}
              path={res.path}
              startOffset={res.startTime}
              duration={res.endTime - res.startTime}
            />
          ))}
        </div>
      </div>
    )
  }
}
