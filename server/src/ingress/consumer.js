const proto = require('apollo-engine-reporting-protobuf')
const { Trace } = require('../persistence')
const { prepareTraces } = require('./utils')
const logger = require('loglevel')
const { redis } = require('../persistence')

const HOUR = 60 * 60 * 1000
const TRACE_THRESHOLD = process.env.TRACE_THRESHOLD || 1
const CULL_KEY = 'lastCull'

function ingest(cullQueue) {
  return async job => {
    logger.info('Processing Job', job.id)
    try {
      const traces = prepareTraces(job.data)
      const graphId = job.data.graphId
      const rowIds = await Trace.create(graphId, traces)
      logger.info('Processed Job', job.id)

      const lastCull = await redis.get(CULL_KEY)

      if (!lastCull || new Date() - new Date(lastCull) > HOUR) {
        // here we check that they are not over the trace threshold
        await cullQueue.add({ threshold: TRACE_THRESHOLD })
      }

      return rowIds
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

async function cull(job) {
  const { threshold } = job.data
  const traces = await Trace.cull(threshold)
  return redis.set(CULL_KEY, new Date().toUTCString())
}

module.exports = {
  ingest,
  cull
}
