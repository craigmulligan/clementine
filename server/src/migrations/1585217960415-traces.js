'use strict'

const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS traces (
      id uuid PRIMARY KEY,
      graph_id uuid REFERENCES graphs (id) ON DELETE CASCADE NOT NULL,
      key text NOT NULL,
      duration float NOT NULL,
      start_time timestamp NOT NULL,
      end_time timestamp NOT NULL,
      root jsonb NOT NULL,
      client_name text,
      client_version text
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
