'use strict'

const { db, sql } = require('../persistence')

module.exports.up = async function(next) {
  await db.query(sql`
    CREATE TABLE IF NOT EXISTS traces (
      id uuid PRIMARY KEY,
      "graphId" uuid REFERENCES graphs (id) ON DELETE CASCADE NOT NULL,
      key text NOT NULL,
      duration float NOT NULL,
      "startTime" timestamp with time zone NOT NULL,
      "endTime" timestamp with time zone NOT NULL,
      root jsonb NOT NULL,
      "clientName" text,
      "clientVersion" text,
      "schemaTag" text,
      "details" jsonb,
      "createdAt" timestamp with time zone default (now() at time zone 'utc') NOT NULL,
      "hasErrors" boolean NOT NULL
    );
  `)

  // await db.query(sql`
  // CREATE INDEX "tracesGraphId" on traces ("graphId");
  // `)
  // await db.query(sql`
  // CREATE INDEX "tracesKey" on traces (key);
  // `)
  // await db.query(sql`
  // CREATE INDEX "tracesClientName" on traces ("clientName");
  // `)

  next()
}

module.exports.down = async function(next) {
  await db.query(sql`
    DROP TABLE traces;
  `)

  next()
}
