const { Router } = require('express')
const bodyParser = require('body-parser')
const proto = require('apollo-engine-reporting-protobuf')
const { Trace, Key } = require('../persistence')
const { prepareTraces } = require('./utils')
const queue = require('./queue')

const router = Router()
// https://www.apollographql.com/docs/graph-manager/setup-analytics/#sending-metrics-to-the-reporting-endpoint
// Some more cases to cover
router.post(
  '/ingress/traces',
  bodyParser.raw({
    type: req => {
      return true
    }
  }),
  async (req, res) => {
    const apiKey = req.get('x-api-key')

    if (!apiKey) {
      return res.status(403).send('FORBIDDEN: Missing apiKey')
    }

    // verifyKey
    const graphId = apiKey.split(':')[0]
    const key = apiKey.split(':')[1]

    const isVerified = await Key.verify(key, graphId)

    if (!isVerified) {
      return res.status(403).send('FORBIDDEN: Invalid apiKey')
    }

    const job = await queue.add(req.body)

    res.status(201).send(job)
  }
)

module.exports = router
