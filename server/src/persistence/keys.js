const { sql } = require('slonik')
const uuid = require('uuid/v4')
const db = require('./db')
const redis = require('./redis')
const { KEY_SECRET } = require('../config')
const { encrypt, decrypt } = require('./crypto')

module.exports = {
  encrypt,
  decrypt,
  async create(graphId) {
    const secret = uuid()
    const hashedSecret = encrypt(secret)
    const { rows } = await db.query(sql`
        INSERT INTO keys (id, secret, "graphId",  prefix)
        VALUES (${uuid()}, ${hashedSecret}, ${graphId}, ${secret.slice(0, 4)})
        RETURNING id, "graphId", prefix;
      `)

    const [key] = rows
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
    const encrypted = encrypt(secret)
    const key = await db.maybeOne(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId} and secret=${encrypted};
    `)

    return !!key
  }
}
