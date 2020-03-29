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

module.exports = {
  extractErrors
}
