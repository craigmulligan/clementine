const { createPool } = require('slonik')

module.exports = createPool(process.env.DATABASE_URL, {
  maximumPoolSize: process.env.MAX_DB_CONNECTIONS || 1
})
