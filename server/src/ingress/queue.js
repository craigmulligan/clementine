const Queue = require('bull')
const ingestQueue = new Queue('trace:ingest', { redis: { host: 'redis' } })
const thresholdQueue = new Queue('trace:threshold', {
  redis: { host: 'redis' }
})

const forwardQueue = new Queue('trace:forward', {
  redis: { host: 'redis' }
})

module.exports = {
  ingestQueue,
  thresholdQueue,
  forwardQueue
}
