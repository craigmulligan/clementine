const sql = require('sql-template-strings');
const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');
const db = require('./db');

module.exports = {
  async create(email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const {rows} = await db.query(sql`
      INSERT INTO users (id, email, password)
        VALUES (${uuid()}, ${email}, ${hashedPassword})
        RETURNING id, email;
      `);

      const [user] = rows;
      return user;
    } catch (error) {
      if (error.constraint === 'users_email_key') {
        return null;
      }

      throw error;
    }
  },
  async find(email) {
    const {rows} = await db.query(sql`
    SELECT * FROM users WHERE email=${email} LIMIT 1;
    `);
    return rows[0];
  },
  async findById(id) {
    const {rows} = await db.query(sql`
    SELECT * FROM users WHERE id=${id} LIMIT 1;
    `);
    return rows[0];
  }
};
