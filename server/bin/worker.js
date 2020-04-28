const logger = require('loglevel')
const { thresholdQueue, ingestQueue } = require('../src/ingress/queue')
const { ingest, cull } = require('../src/ingress/consumer')

logger.info('Running worker')

ingestQueue.process(ingest(thresholdQueue))
cullQueue.process(cull)
