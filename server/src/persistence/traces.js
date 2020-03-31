const { sql } = require('slonik')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const pg = require('pg')
const db = require('./db')
const format = require('pg-format')
const logger = require('loglevel')

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
        details,
        hasErrors
      } = trace

      return [
        uuid(),
        key,
        graphId,
        durationNs,
        startTime.toUTCString(),
        endTime.toUTCString(),
        JSON.stringify(root),
        !!hasErrors
      ]
    })

    const query = sql`
      INSERT INTO traces (id, key, "graphId", "duration", "startTime", "endTime", "root", "hasErrors")
      SELECT *
      FROM ${sql.unnest(values, [
        'uuid',
        'text',
        'uuid',
        'float8',
        'timestamp',
        'timestamp',
        'jsonb',
        'bool'
      ])}
      RETURNING id 
      ;
    `

    // const query = format(
    // `
    // INSERT INTO traces (id, key, "graphId", duration, "startTime", "endTime", root, "schemaTag", details, "hasErrors")
    // VALUES %L
    // RETURNING id;
    // `,
    // values
    // )

    const { rows } = await db.query(query)
    return rows
  },
  async findAll({ graphId }) {
    const { rows } = await db.query(sql`
      SELECT * FROM traces WHERE "graphId"=${graphId};
      `)
    return rows
  },
  async findAllOperations(
    { graphId },
    orderBy = { field: 'count', asc: false },
    cursor,
    limit
  ) {
    // get slowest by 95 percentile, count and group by key.
    // TODO we probably need a better query builder
    //
    let cursorClause = sql``

    if (cursor) {
      if (orderBy.asc) {
        cursorClause = sql` asc where ${sql.identifier([
          orderBy.field
        ])} >= ${cursor}`
      }
      cursorClause = sql` desc where ${sql.identifier([
        orderBy.field
      ])} >= ${cursor}`
    }

    const query = sql`SELECT * from (SELECT key, PERCENTILE_CONT(0.95) within group (order by duration asc) as duration, count(id) as count FROM traces WHERE "graphId"=${graphId} group by key) as ops order by ${sql.identifier(
      [orderBy.field]
    )}  ${cursorClause} limit ${limit}`

    //
    // order by ${sql.identifier(
    // orderBy.field
    // )}  as ops limit ${limit}

    // if (!orderBy.asc) {
    // query.append(sql` desc`)
    // }

    // query.append(sql`) as ops`)

    // if (cursor) {
    // if (orderBy.field == 'count') {
    // query.append(sql` where count`)
    // }

    // if (orderBy.field == 'duration') {
    // query.append(sql` where duration`)
    // }

    // orderBy.asc
    // ? query.append(sql` >= ${cursor}`)
    // : query.append(sql` <= ${cursor}`)
    // }

    // query.append(sql` limit ${limit}`)

    // logger.debug(query.sql)
    // logger.debug(query.values)

    const { rows } = await db.query(query)
    return rows
  }
}
