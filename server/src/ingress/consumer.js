const proto = require('apollo-engine-reporting-protobuf')
const { Trace, Key } = require('../persistence')
const { prepareTraces } = require('./utils')
const logger = require('loglevel')

async function process(job) {
  logger.info('Processing Job', job.id)
  try {
    const traces = prepareTraces(job.data)
    const rowIds = await Trace.create(job.data.graphId, traces)

    logger.info('Processed Job', job.id)
    return rowIds
  } catch (err) {
    console.log(err)
    throw err
  }
}

module.exports = process
