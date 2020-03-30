const extractErrors = (node, acc = []) => {
  if (node.error.length > 0) {
    acc.push(...node.error)
  }

  if (node.child) {
    node.child.map(n => {
      extractErrors(n, acc)
    })
  }

  return acc
}

function parseTS(message) {
  return new Date(message.seconds * 1000 + message.nanos / 1000)
}


function prepareTraces(report) {
    return Object.entries(report.tracesPerQuery).reduce(
      (acc, [key, v]) => {
        return [
          ...acc,
          ...v.trace.map(trace => {
            return {
              key,
              ...trace,
              startTime: parseTS(trace.endTime),
              endTime: parseTS(trace.startTime),
              hasErrors: extractErrors(trace.root).length > 0
            }
          })
        ]
      },
      []
    )
}

module.exports = {
  extractErrors,
  prepareTraces,
}
