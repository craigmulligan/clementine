const { Pool } = require('pg')

module.exports = new Pool({
  max: process.env.WORKER_MAX || 1,
  connectionString: process.env.DATABASE_URL
})
