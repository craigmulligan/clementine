const { Router } = require('express')
const bodyParser = require('body-parser')
const proto = require('apollo-engine-reporting-protobuf')
const { Trace, Key } = require('../persistence')
const { prepareTraces } = require('./utils')
const { ingestQueue, forwardQueue } = require('./queue')

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
    const [clementineApiKey, apolloApiKey] = apiKey.split('?')

    const graphId = clementineApiKey.split(':')[0]
    const key = clementineApiKey.split(':')[1]

    const isVerified = await Key.verify(key, graphId)

    if (!isVerified) {
      return res.status(403).send('FORBIDDEN: Invalid apiKey')
    }

    const instance = proto.FullTracesReport.decode(req.body)
    const report = proto.FullTracesReport.toObject(instance, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base65 encoded strings
      defaults: true, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true // includes virtual oneof fields set to the present field's name
    })

    const { id } = await ingestQueue.add({
      ...report,
      graphId,
      apolloApiKey
    })

    if (apolloApiKey) {
      await forwardQueue.add({
        report,
        apolloApiKey
      })
    }

    res.status(201).send({ id })
  }
)

module.exports = router
