const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(name, user_id) {
    const { rows } = await db.query(sql`
      INSERT INTO graphs (id, name, user_id)
        VALUES (${uuid()}, ${name}, ${user_id})
        RETURNING id, name, user_id;
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
    SELECT * FROM graphs WHERE user_id=${user_id};
    `)
    return rows
  }
}
