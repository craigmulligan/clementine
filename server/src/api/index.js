const { Router } = require('express')
const bodyParser = require('body-parser')
const proto = require('apollo-engine-reporting-protobuf')
const _ = require('lodash')
const db = require('../persistence/db')
const fs = require('fs')
const base64 = require('@protobufjs/base64')

function parseTS(message) {
  return new Date(message.seconds * 1000 + message.nanos / 1000)
}

const router = Router()

router.post(
  '/ingress/traces',
  bodyParser.raw({
    type: req => {
      return true
    }
  }),
  async (req, res) => {
    const instance = proto.FullTracesReport.decode(req.body)
    console.log(instance.toJSON())
    fs.writeFileSync(
      `${__dirname}/dummy-json.json`,
      JSON.stringify(instance.toJSON())
    )
    const report = proto.FullTracesReport.toObject(instance, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base64 encoded strings
      defaults: true, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true // includes virtual oneof fields set to the present field's name
    })

    // await Trace.create(report.trace[0])
    // console.log('points written!', report)
    res.status(201).send()
  }
)

module.exports = router
