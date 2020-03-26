const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(graphId, trace) {
    const {
      duration,
      key,
      startTime,
      endTime,
      execution,
      validation,
      parsing
    } = trace

    try {
      const { rows } = await db.query(sql`
      INSERT INTO traces (id, key, source, duration, startTime, endTime)
        VALUES (${uuid()}, ${key}, ${duration}, ${startTime}, ${endTime}, ${execution}, ${validation}, ${parsing})
        RETURNING id;
      `)

      const [trace] = rows
      return trace
    } catch (error) {
      throw error
    }
  },
  async findAll({ userId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM traces WHERE graphId=${graphId};
      `)
    return rows
  }
}
