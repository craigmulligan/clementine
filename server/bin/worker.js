const logger = require('loglevel')
const { thresholdQueue, ingestQueue } = require('../src/ingress/queue')
const { ingest, cull } = require('../src/ingress/consumer')
if (process.env.LOG_LEVEL != null) logger.setLevel(process.env.LOG_LEVEL)

logger.info('Running worker')

ingestQueue.process(ingest(thresholdQueue))
thresholdQueue.process(cull)
