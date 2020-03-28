'use strict'

const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS graphs (
      id uuid PRIMARY KEY,
      user_id uuid REFERENCES users (id) ON DELETE CASCADE,
      name text
    );
  `)

  await client.query(`
    CREATE INDEX graph_user on users (id);
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
