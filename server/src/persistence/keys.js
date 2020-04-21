const { sql } = require('slonik')
const uuid = require('uuid/v4')
const db = require('./db')
const redis = require('./redis')
const { KEY_SECRET } = require('../config')
const crypto = require('crypto')

function hash(str) {
  return crypto
    .createHash('sha256')
    .update(str)
    .digest('hex')
}

module.exports = {
  hash,
  async create(graphId) {
    const secret = uuid()
    const hashedSecret = hash(secret)
    const { rows } = await db.query(sql`
        INSERT INTO keys (id, hash, "graphId",  prefix)
        VALUES (${uuid()}, ${hashedSecret}, ${graphId}, ${secret.slice(0, 4)})
        RETURNING id, "graphId", prefix;
      `)

    const [key] = rows

    // we return the plain text secret only on create.
    return {
      ...key,
      secret
    }
  },
  findById(keyId) {
    return db.maybeOne(sql`
      SELECT * FROM keys WHERE "id"=${keyId};
    `)
  },
  revoke(keyId) {
    return db.maybeOne(sql`
      DELETE FROM keys WHERE "id"=${keyId};
    `)
  },
  async findAll({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId};
    `)

    return rows
  },
  async verify(secret, graphId) {
    const hashedSecret = hash(secret)
    const key = await db.maybeOne(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId} and hash=${hashedSecret};
    `)

    return !!key
  }
}
