const db = require('./db')
const { sql } = require('slonik')
const { cloneDeep } = require('lodash')
const logger = require('loglevel')

const ensureMigrationsTable = db =>
  db.query(
    sql`CREATE TABLE IF NOT EXISTS migrations (id integer PRIMARY KEY, data jsonb NOT NULL)`
  )

const postgresStateStorage = {
  async load(fn) {
    await ensureMigrationsTable(db)
    // Load the single row of migration data from the database
    const { rows } = await db.query(sql`SELECT data FROM migrations`)

    if (rows.length !== 1) {
      logger.warn(
        'Cannot read migrations from database. If this is the first time you run migrations, then this is normal.'
      )

      return fn(null, {})
    }

    // Call callback with new migration data object
    fn(null, rows[0].data)
  },

  async save(set, fn) {
    // Check if table 'migrations' exists and if not, create it.
    await ensureMigrationsTable(db)

    const migrationMetaData = cloneDeep({
      lastRun: set.lastRun,
      migrations: set.migrations
    })

    await db.query(sql`
      INSERT INTO migrations (id, data)
      VALUES (1, ${sql.json(migrationMetaData)})
      ON CONFLICT (id) DO UPDATE SET data = ${sql.json(migrationMetaData)}
    `)

    fn()
  }
}

module.exports = Object.assign(() => {
  return postgresStateStorage
}, postgresStateStorage)
