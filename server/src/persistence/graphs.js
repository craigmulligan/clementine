const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(name, user_id) {
    const { rows } = await db.query(sql`
      INSERT INTO graphs (id, name, "userId")
        VALUES (${uuid()}, ${name}, ${user_id})
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
  async findAll({ user_id }) {
    const { rows } = await db.query(sql`
    SELECT * FROM graphs WHERE "userId"=${user_id};
    `)
    return rows
  }
}
