const { sql } = require('slonik')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(email, password) {
    try {
      const { rows } = await db.query(sql`
      INSERT INTO users (id, email)
        VALUES (${uuid()}, ${email})
        RETURNING id, email, "isVerified";
      `)

      const [user] = rows
      return user
    } catch (error) {
      throw error
    }
  },
  async find(email) {
    return await db.maybeOne(sql`
    SELECT * FROM users WHERE email=${email};
    `)
  },
  async markVerified(id) {
    return await db.query(sql`
    UPDATE users SET "isVerified" = true WHERE id=${id};
    `)
  },
  async findById(id) {
    if (!id) {
      return null
    }

    return db.maybeOne(sql`
    SELECT * FROM users WHERE id=${id};
    `)
  }
}
