'use strict'

const { db, sql } = require('../persistence')

module.exports.up = async function(next) {
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS graphs (
      id uuid PRIMARY KEY,
      "userId" uuid REFERENCES users (id) ON DELETE CASCADE,
      name text,
      "createdAt" timestamp with time zone default (now() at time zone 'utc') NOT NULL
    );
  `)

  // await db.query(sql`
  // CREATE INDEX "graphUser" on graphs ("userId");
  // `)

  next()
}

module.exports.down = async function(next) {
  await db.query(sql`
  DROP TABLE graphs;
  `)

  next()
}
