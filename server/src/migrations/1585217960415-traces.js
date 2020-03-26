'use strict'

const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS traces (
      id uuid PRIMARY KEY,
      graphId uuid REFERENCES graphs (id) ON DELETE CASCADE,
      duration float,
      startTime timestamp default (now() at time zone 'utc'),
      endTime timestamp default (now() at time zone 'utc'),
      execution jsonb,
      validation jsonb,
      parsing jsonb
    );
  `)

  await client.query(`
    CREATE INDEX graph_trace on graphs (id);
  `)

  await client.release(true)
  next()
}

module.exports.down = async function(next) {
  const client = await db.connect()

  await client.query(`
  DROP TABLE traces;
  `)

  await client.release(true)
  next()
}
