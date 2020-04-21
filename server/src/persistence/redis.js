const promisify = require('util').promisify
const redis = require('redis').createClient({ host: 'redis' })

const get = promisify(redis.get).bind(redis)
const set = promisify(redis.set).bind(redis)
const del = promisify(redis.del).bind(redis)
const flushdb = promisify(redis.flushdb).bind(redis)

module.exports = {
  get,
  set,
  del,
  flushdb,
  client: redis
}
