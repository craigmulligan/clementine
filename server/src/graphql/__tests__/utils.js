const uuidByString = require('uuid-by-string')
const uuid = require('uuid/v4')
const { magicLink } = require('../../index')

function randomInt(max) {
  return Math.floor(Math.random() * Math.floor(max))
}

function generateTraces(n) {
  const operationKeys = [...Array(11).keys()].map(() => uuid())

  return [...Array(n).keys()].map(i => {
    const startTime = Date.now()
    const durationNs = randomInt(4679795)
    const endTime = startTime - durationNs * 1000 * 1000
    const key = operationKeys[randomInt(11)]

    return {
      durationNs,
      key,
      operationId: uuidByString(key),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      root: {},
      clientName: uuid(),
      clientVersion: uuid(),
      schemaTag: uuid(),
      details: {},
      hasErrors: !!randomInt(1)
    }
  })
}

function raiseGqlErr(res) {
  if (res.body.errors) {
    throw Error(JSON.stringify(res.body.errors))
  }

  return res
}

async function generateToken(user) {
  const [token, _] = await magicLink.generate(user)
  return token
}

function login(request, token) {
  return request.get(`/magic?token=${token}`)
}

module.exports = { generateTraces, raiseGqlErr, generateToken, login }
