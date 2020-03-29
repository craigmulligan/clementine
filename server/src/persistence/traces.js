const sql = require('sql-template-strings')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const pg = require('pg')
const db = require('./db')
const format = require('pg-format')

module.exports = {
  async create(graph_id, traces) {
    const values = traces.map(trace => {
      const {
        durationNs,
        key,
        startTime,
        endTime,
        root,
        clientName,
        clientVersion
      } = trace

      return [
        uuid(),
        key,
        graph_id,
        durationNs,
        startTime,
        endTime,
        JSON.stringify(root)
      ]
    })

    const query = format(
      `
        INSERT INTO traces (id, key, graph_id, duration, start_time, end_time, root)
          VALUES %L
          RETURNING id;
        `,
      values
    )

    const { rows } = await db.query(query)
    return rows
  },
  async findAll({ graph_id }) {
    const { rows } = await db.query(sql`
      SELECT * FROM traces WHERE graph_id=${graph_id};
      `)
    return rows
  },
  async find_all_slowest({ graph_id }) {
    const { rows } = await db.query(sql`
      SELECT key as id, avg(duration) as duration, count(id) as requests_count FROM traces WHERE graph_id=${graph_id}  group by key order by duration desc;
    `)
    return rows
  }
}
