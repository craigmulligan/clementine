const db = require('../persistence/db')

module.exports.up = async function(next) {
  const client = await db.connect()

  await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    email text UNIQUE,
    "createdAt" timestamp default (now() at time zone 'utc') NOT NULL,
    password text
  );
  `)

  await client.query(`
    CREATE INDEX "usersEmail" on users (email);
  `)

  await client.release(true)
  next()
}

module.exports.down = async function(next) {
  const client = await db.connect()

  await client.query(`
  DROP TABLE users;
  `)

  await client.release(true)
  next()
}
