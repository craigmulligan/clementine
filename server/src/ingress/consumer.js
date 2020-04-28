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
    logger.info('ingest job starting', job.id)
    try {
      const traces = prepareTraces(job.data)
      const graphId = job.data.graphId
      const rowIds = await Trace.create(graphId, traces)
      const lastCull = await redis.get(CULL_KEY)

      if (!lastCull || new Date() - new Date(lastCull) > HOUR) {
        // here we check that they are not over the trace threshold
        try {
          await cullQueue.add({ threshold: TRACE_THRESHOLD })
        } catch (e) {
          logger.error(e)
        }
      }

      logger.info('ingest job complete', job.id)

      return rowIds
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

async function cull(job) {
  logger.info('Cull job starting', job.id)
  const { threshold } = job.data
  const traces = await Trace.cull(threshold)
  await redis.set(CULL_KEY, new Date().toUTCString())
  logger.info('Cull job complete', job.id)
  return
}

module.exports = {
  ingest,
  cull
}
