const Queue = require('bull')
const ingestQueue = new Queue('trace:ingest', { redis: { host: 'redis' } })
const thresholdQueue = new Queue('trace:threshold', {
  redis: { host: 'redis' }
})

module.exports = {
  ingestQueue,
  thresholdQueue
}
