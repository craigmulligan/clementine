const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(name, userId) {
    try {
      const { rows } = await db.query(sql`
      INSERT INTO graphs (id, name, userId)
        VALUES (${uuid()}, ${name}, ${userId})
        RETURNING id, name, userId;
      `)

      const [graph] = rows
      return graph
    } catch (error) {
      if (error.constraint === 'graph_user_key') {
        return null
      }

      throw error
    }
  },
  async findAll({ userId }) {
    const { rows } = await db.query(sql`
    SELECT * FROM graphs WHERE userId=${userId};
    `)
    return rows
  }
}
