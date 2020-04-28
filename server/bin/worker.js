const logger = require('loglevel')
const {
  thresholdQueue,
  ingestQueue,
  forwardQueue
} = require('../src/ingress/queue')
const { ingest, cull, forward } = require('../src/ingress/consumer')
const fetch = require('node-fetch')
if (process.env.LOG_LEVEL != null) logger.setLevel(process.env.LOG_LEVEL)

logger.info('Running workers')

ingestQueue.process(ingest(thresholdQueue))
thresholdQueue.process(cull)
forwardQueue.process(forward(fetch))
