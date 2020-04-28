const Queue = require('bull')
// TODO if we want to rate limit per graph we will need a queue per graph.
const traceQueue = new Queue('trace:ingest', { redis: { host: 'redis' } })

module.exports = traceQueue
