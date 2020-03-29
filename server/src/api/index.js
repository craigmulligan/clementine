const { Router } = require('express')
const bodyParser = require('body-parser')
const proto = require('apollo-engine-reporting-protobuf')
const { Trace } = require('../persistence')
const fs = require('fs')
const { extractErrors } = require('./utils')

function parseTS(message) {
  return new Date(message.seconds * 1000 + message.nanos / 1000)
}

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
    const instance = proto.FullTracesReport.decode(req.body)
    const apiKey = req.get('x-api-key')

    if (!apiKey) {
      return res.status(403).send('FORBIDDEN: Missing apiKey')
    }

    // verifyKey
    const graphId = apiKey.split(':')[0]

    // fs.writeFileSync(
    // `${__dirname}/trace-with-error.json`,
    // JSON.stringify(instance.toJSON())
    // )

    const report = proto.FullTracesReport.toObject(instance, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base64 encoded strings
      defaults: true, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true // includes virtual oneof fields set to the present field's name
    })

    const traces = Object.entries(report.tracesPerQuery).reduce(
      (acc, [key, v]) => {
        return [
          ...acc,
          ...v.trace.map(trace => {
            return {
              key,
              ...trace,
              startTime: parseTS(trace.endTime),
              endTime: parseTS(trace.startTime)
            }
          })
        ]
      },
      []
    )

    const rowIds = await Trace.create(graphId, traces)
    res.status(201).send(rowIds)
  }
)

module.exports = router
