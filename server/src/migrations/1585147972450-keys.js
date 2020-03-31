'use strict'

const { db, sql } = require('../persistence')

module.exports.up = async function(next) {
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS keys (
      id uuid PRIMARY KEY,
      "createdAt" timestamp with time zone default (now() at time zone 'utc') NOT NULL,
      "graphId" uuid REFERENCES graphs (id) ON DELETE CASCADE,
      secret text
    );
  `)

  // await db.query(sql`
  // CREATE INDEX "graphKey" on keys ("graphId");
  // `)

  next()
}

module.exports.down = async function(next) {
  await db.query(sql`
    DROP TABLE keys;
  `)
  next()
}
