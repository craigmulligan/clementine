'use strict'

const { db, sql } = require('../persistence')

module.exports.up = async function(next) {
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS keys (
      id uuid PRIMARY KEY,
      "createdAt" timestamp with time zone default (now() at time zone 'utc') NOT NULL,
      "graphId" uuid REFERENCES graphs (id) ON DELETE CASCADE,
      hash text UNIQUE,
      prefix text
    );
    CREATE INDEX IF NOT EXISTS "keyGraph" on keys ("graphId");
  `)

  next()
}

module.exports.down = async function(next) {
  await db.query(sql`
    DROP TABLE keys;
    DROP INDEX IF EXISTS "keyGraph";
  `)
  next()
}
