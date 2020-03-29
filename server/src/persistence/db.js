const { Pool } = require('pg')

module.exports = new Pool({
  max: process.env.MAX_DB_CONNECTIONS || 1,
  connectionString: process.env.DATABASE_URL
})
