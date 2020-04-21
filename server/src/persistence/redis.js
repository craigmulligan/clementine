const redis = require('redis').createClient({ host: 'redis' })

module.exports = redis
