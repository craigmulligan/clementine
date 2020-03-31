const { sql } = require('slonik')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(name, userId) {
    const { rows } = await db.query(sql`
      INSERT INTO graphs (id, name, "userId")
        VALUES (${uuid()}, ${name}, ${userId})
        RETURNING id, name, "userId";
      `)

    const [graph] = rows
    return graph
  },
  async findById(id) {
    const { rows } = await db.query(sql`
    SELECT * FROM graphs WHERE id=${id} LIMIT 1;
    `)

    const [graph] = rows
    return graph
  },
  async findAll({ userId }) {
    const { rows } = await db.query(sql`
    SELECT * FROM graphs WHERE "userId"=${userId};
    `)
    return rows
  }
}
