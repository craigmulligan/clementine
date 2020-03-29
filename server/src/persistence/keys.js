const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const crypto = require('crypto')
const db = require('./db')
const { KEY_SECRET } = require('../config')
const algorithm = 'aes-256-ctr'

function encrypt(text) {
  const cipher = crypto.createCipher(algorithm, KEY_SECRET)
  let crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt(text) {
  const decipher = crypto.createDecipher(algorithm, KEY_SECRET)
  let dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

module.exports = {
  encrypt,
  decrypt,
  async create(graphId) {
    const secret = encrypt(uuid())

    const { rows } = await db.query(sql`
        INSERT INTO keys (id, secret, "graphId")
        VALUES (${uuid()}, ${secret}, ${graphId})
        RETURNING id, secret, "graphId";
      `)

    const [key] = rows
    return key
  },
  async findAll({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM keys WHERE "graphId"=${graphId};
    `)

    return rows
  }
}
