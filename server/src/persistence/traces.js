const { sql } = require('slonik')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const db = require('./db')

const Operators = {
  eq: sql` = `,
  ne: sql` <> `
}

function compileTraceFilters(filters) {
  const q = filters
    .filter(f => {
      if (!f) {
        return false
      }
      return !!(f.field && f.value && f.operator)
    })
    .map(f => {
      return sql.join(
        [sql`${sql.identifier([f.field])}`, sql`${f.value}`],
        Operators[f.operator]
      )
    })

  return sql.join(q, sql` AND `)
}

module.exports = {
  async create(graphId, traces) {
    // TODO
    // Add details, cacheHits
    const values = traces.map(trace => {
      const {
        durationNs,
        key,
        operationId,
        startTime,
        endTime,
        root,
        clientName,
        clientVersion,
        schemaTag,
        details,
        hasErrors
      } = trace

      console.log(details)

      return [
        uuid(),
        key,
        graphId,
        durationNs,
        startTime.toUTCString(),
        endTime.toUTCString(),
        JSON.stringify(root),
        !!hasErrors,
        clientName,
        clientVersion,
        schemaTag,
        operationId,
        JSON.stringify(details)
      ]
    })

    const query = sql`
      INSERT INTO traces (id, key, "graphId", "duration", "startTime", "endTime", "root", "hasErrors", "clientName", "clientVersion", "schemaTag", "operationId", "details")
      SELECT *
      FROM ${sql.unnest(values, [
        'uuid',
        'text',
        'uuid',
        'float8',
        'timestamp',
        'timestamp',
        'jsonb',
        'bool',
        'text',
        'text',
        'text',
        'uuid',
        'jsonb'
      ])}
      RETURNING id
      ;
    `

    const { rows } = await db.query(query)
    return rows
  },
  async findAll(
    traceFilters = [],
    { to, from },
    orderBy = { field: 'duration', asc: false },
    cursor,
    limit = 7
  ) {
    // get slowest by 95 percentile, count and group by key.
    let cursorClause = sql``
    let orderDirection = sql``

    if (cursor) {
      if (orderBy.asc) {
        cursorClause = sql` where id >= ${cursor}`
      } else {
        cursorClause = sql` where id <= ${cursor}`
      }
    }

    if (orderBy.asc) {
      orderDirection = sql` asc`
    } else {
      orderDirection = sql` desc`
    }

    const query = sql`
    SELECT * from (
      SELECT * FROM traces
      WHERE ${compileTraceFilters(traceFilters)}
      AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
      order by ${sql.identifier([
        orderBy.field
      ])}${orderDirection}, key ${orderDirection}
    ) as orderedTraces
    ${cursorClause}
    limit ${limit}`

    const { rows } = await db.query(query)
    return rows
  },
  findById(traceId) {
    const query = sql`
      SELECT * FROM traces
      where "id" = ${traceId}
    `

    return db.one(query)
  },
  async findAllOperations(
    traceFilters = [],
    { to, from },
    orderBy = { field: 'count', asc: false },
    cursor = [],
    limit = 1
  ) {
    // TODO clean up this query had to use row_number for pagination because sort by uuid + other order was
    // giving inconsistent results
    // get slowest by 95 percentile, count and group by key.
    let cursorClause = sql``
    let orderDirection = sql``

    if (cursor.length > 0) {
      cursorClause = sql` where ${sql.identifier([cursor[1]])} >= ${cursor[0]}`
    }

    if (orderBy.asc) {
      orderDirection = sql` asc`
    } else {
      orderDirection = sql` desc`
    }

    const query = sql`
    with ops as (
        select *, 
        (CASE WHEN count = 0 THEN 0 ELSE (100 * "errorCount"/count) END) as "errorPercent"
        from (
          SELECT  key, "operationId" as id, PERCENTILE_CONT(0.95)
          within group (order by duration asc) as duration,
          count(CASE WHEN "hasErrors" THEN 1 END) as "errorCount",
          count(id) as count FROM traces
          WHERE ${compileTraceFilters(traceFilters)}
          AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
          group by key, "operationId"
        ) opsWithErrorRate
    )

    SELECT * from (
      SELECT
        *,
        row_number() over (
          order by ${sql.identifier(['ops', orderBy.field])}${orderDirection}
        ) as "rowNumber",
        (CASE WHEN count = 0 THEN 0 ELSE (100 * "errorCount"/count) END) as "errorPercent"
      from ops
      order by ${sql.identifier(['ops', orderBy.field])}${orderDirection}
    ) as orderedOps
    ${cursorClause}
    limit ${limit}`

    const { rows } = await db.query(query)
    return rows
  },
  findStats(traceFilters = [], { to, from }) {
    const query = sql`
          select *,
          (CASE WHEN duration IS NULL then 0 ELSE duration END) as "duration",
          (CASE WHEN count = 0 THEN 0 ELSE (100 * "errorCount"/count) END) as "errorPercent"
          from (
            select count(id) as count,
            count(CASE WHEN "hasErrors" THEN 1 END) as "errorCount",
            PERCENTILE_CONT(0.95) within group (order by duration asc) as duration
            FROM traces
            WHERE ${compileTraceFilters(traceFilters)}
            AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
          ) as graphStats;`

    return db.one(query)
  },
  async findRPM(traceFilters, { to, from }) {
    const gap = to - from
    // we always have 100 "intervals in the series".
    // probably a smart way to do this in postgres instead.
    const interval = Math.floor(gap / 1000 / 60 / 100) || 1
    const intervalMin = interval + ' minute'

    const query = sql`
      with series as (
        select interval from generate_series(date_round(${from.toUTCString()}, ${intervalMin}), date_round(${to.toUTCString()}, ${intervalMin}), (${intervalMin})::INTERVAL) as interval
      ),
      rpm as (
        select "startTime", "hasErrors" from traces
        WHERE ${compileTraceFilters(traceFilters)}
        AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
      )

      SELECT
        count("startTime") as count,
        count(CASE WHEN "hasErrors" THEN 1 END) as "errorCount",
        interval as "startTime"
      FROM series
        left outer JOIN rpm on date_round(rpm."startTime", ${intervalMin}) = interval
        group by interval
        order by interval;
      `

    const { rows } = await db.query(query)
    return rows
  },
  async latencyDistribution(traceFilters, { to, from }) {
    // this is not bound by time may have to do for bigger data sets.
    const tfs = compileTraceFilters(traceFilters)

    const query = sql`
      WITH min_max AS (
          SELECT
              min(duration) AS min_val,
              max(duration) AS max_val
          FROM traces
          where ${tfs}
          AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
          AND NOT "hasErrors"
      )
      SELECT
          min(duration) as min_duration,
          max(duration) as duration,
          count(*),
          width_bucket(duration, min_val, max_val, 50) AS bucket
      FROM traces, min_max
      WHERE ${tfs}
      AND "startTime" between ${from.toUTCString()} and ${to.toUTCString()}
      AND NOT "hasErrors"
      GROUP BY bucket
      ORDER BY bucket;
    `

    const { rows } = await db.query(query)
    return rows
  },
  findFilterOptions({ graphId }) {
    const query = sql`
    with cte as (
      select "schemaTag", "clientName", "clientVersion" from traces
      where "graphId"=${graphId}
    )

    select
      ARRAY(select distinct "schemaTag" from cte) as "schemaTag",
      ARRAY(select distinct "clientName" from cte) as "clientName",
      ARRAY(select distinct "clientVersion" from cte) as "clientVersion"
    `

    return db.one(query)
  }
}
