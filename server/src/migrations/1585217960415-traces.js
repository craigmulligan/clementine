'use strict'

const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
    CREATE TABLE IF NOT EXISTS traces (
      id uuid PRIMARY KEY,
      "graphId" uuid REFERENCES graphs (id) ON DELETE CASCADE NOT NULL,
      key text NOT NULL,
      duration float NOT NULL,
      "startTime" timestamp NOT NULL,
      "endTime" timestamp NOT NULL,
      root jsonb NOT NULL,
      "clientName" text,
      "clientVersion" text
    );
  `)

  await client.query(`
    CREATE INDEX "graphTrace" on graphs (id);
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
