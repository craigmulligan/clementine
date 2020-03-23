const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

module.exports = {
  async create(key, source, trace) {
    const {
      duration,
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
      if (error.constraint === 'users_email_key') {
        return null
      }

      throw error
    }
  }
}
