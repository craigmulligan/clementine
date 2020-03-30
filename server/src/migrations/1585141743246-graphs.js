'use strict'

const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS graphs (
      id uuid PRIMARY KEY,
      "userId" uuid REFERENCES users (id) ON DELETE CASCADE,
      name text,
      "createdAt" timestampz default (now() at time zone 'utc') NOT NULL
    );
  `)

  await client.query(`
    CREATE INDEX "graphUser" on graphs ("userId");
  `)

  await client.release(true)
  next()
}

module.exports.down = async function(next) {
  const client = await db.connect()

  await client.query(`
  DROP TABLE graphs;
  `)

  await client.release(true)
  next()
}
