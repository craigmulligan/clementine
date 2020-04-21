const { sql } = require('slonik')
const uuid = require('uuid/v4')
const db = require('./db')
const redis = require('./redis')
const { KEY_SECRET } = require('../config')
const crypto = require('crypto')
const EXPIRE = 216000 // 1 Day (we revoke on delete)

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
  async revoke(keyId) {
    const key = await this.findById(keyId)
    await db.maybeOne(sql`
      DELETE FROM keys WHERE "id"=${keyId};
    `)

    return redis.del(`key:${key.hash}`)
  },
  async findAll({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId};
    `)

    return rows
  },
  async verify(secret, graphId) {
    const hashedSecret = hash(secret)
    const cachedKey = await redis.get(`key:${hashedSecret}`)
    if (cachedKey) {
      return true
    }

    const key = await db.maybeOne(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId} and hash=${hashedSecret};
    `)

    if (key) {
      await redis.set(
        `key:${hashedSecret}`,
        JSON.stringify({ validated: true }),
        'EX',
        EXPIRE
      )

      return true
    }

    return false
  }
}
