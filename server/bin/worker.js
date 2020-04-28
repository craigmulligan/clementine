const logger = require('loglevel')
const consumer = require('../src/ingress/consumer')
const queue = require('../src/ingress/queue')

logger.info('Running worker')
queue.process(consumer)
