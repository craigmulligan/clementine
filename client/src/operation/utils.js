import { getOperationName } from 'apollo-utilities'

export function getOperationTypes(doc) {
  let operationTypes = []

  const definitions = doc.definitions.filter(
    definition => definition.kind === 'OperationDefinition'
  )

  const isQuery = definitions.some(def => def.operation === 'query')
  const isMutation = definitions.some(def => def.operation === 'mutation')

  if (isQuery) {
    operationTypes.push('query')
  }

  if (isMutation) {
    operationTypes.push('mutation')
  }

  return operationTypes
}

export {
  getOperationName
}
