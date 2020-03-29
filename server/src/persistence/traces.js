const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const pg = require('pg')
const db = require('./db')
const format = require('pg-format')

module.exports = {
  async create(graphId, traces) {
    const values = traces.map(trace => {
      const {
        durationNs,
        key,
        startTime,
        endTime,
        root,
        clientName,
        clientVersion,
        schemaTag,
        details
      } = trace

      return [
        uuid(),
        key,
        graphId,
        durationNs,
        startTime,
        endTime,
        JSON.stringify(root),
        schemaTag,
        details
      ]
    })

    const query = format(
      `
        INSERT INTO traces (id, key, "graphId", duration, "startTime", "endTime", root, "schemaTag", details)
          VALUES %L
          RETURNING id;
        `,
      values
    )

    const { rows } = await db.query(query)
    return rows
  },
  async findAll({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM traces WHERE "graphId"=${graphId};
      `)
    return rows
  },
  async findAllSlowest({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT key as id, avg(duration) as duration, count(id) as count FROM traces WHERE "graphId"=${graphId}  group by key order by duration desc;
    `)
    return rows
  }
}
