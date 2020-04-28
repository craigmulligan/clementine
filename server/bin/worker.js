const logger = require('loglevel')
const consumer = require('../src/ingress/consumer')
const queue = require('../src/ingress/queue')

logger.info('run worker')
console.log('run worker')
queue.process(consumer)
