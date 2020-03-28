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
  async create(graph_id) {
    const secret = encrypt(uuid())

    const { rows } = await db.query(sql`
        INSERT INTO keys (id, secret, graph_id)
        VALUES (${uuid()}, ${secret}, ${graph_id})
        RETURNING id, secret, graph_id;
      `)

    const [key] = rows
    return key
  },
  async findAll({ graph_id }) {
    const { rows } = await db.query(sql`
      SELECT * FROM keys WHERE graph_id=${graph_id};
    `)

    return rows
  }
}
