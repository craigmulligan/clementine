const { db, sql } = require('../persistence')

module.exports.up = async function(next) {
  await db.query(sql`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    "createdAt" timestamp with time zone default (now() at time zone 'utc') NOT NULL,
    "isVerified" boolean default FALSE
  );
  CREATE INDEX IF NOT EXISTS  "usersEmail" on users (email);
  `)

  next()
}

module.exports.down = async function(next) {
  await db.query(sql`
    DROP TABLE users;
    DROP INDEX IF EXISTS "usersEmail";
  `)
  next()
}
