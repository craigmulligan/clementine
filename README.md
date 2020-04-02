# Clementine

> Graphql analytics and observability platform

## Setup

```
make dev
```

- Server -> localhost:3000
- Client -> localhost:5000
- Postgres -> localhost:5432
- Redis -> localhost:6379

Postgres is exposed on port `5432`. The connection string is `postgres://user:pass@localhost:35432/db` (username, password and database name are defined in [./docker-compose.yaml](./docker-compose.yaml)).

You can connect to Postgres using the psql client:

```sh
psql postgres://user:pass@localhost:5432/db
```

`npm run migrate` will run the migrations.

`npm run migrate:down` will roll back the migrations.

`npm run migrate:create <migration-name>` will create a new migration file in [./src/migrations](./src/migrations).

# TODO:

- Add permissions [server]
- Basic UI wireframes [client]
- Add apiKey checks + rate limiting on ingress endpoint [server]
- Better Logging [Server & Client]
- Ability to remove/revoke a key [Server & Client]
- Switch to preprocess queries [Client]
- user prepared statements in postgres [Server] https://github.com/felixfbecker/node-sql-template-strings#named-prepared-statements-in-postgres
- Entire migration set run in transaction [Server]
- Proxy requests in dev mode to api [Client]

# NOTES

- API_KEY needs to be in format `service_id:<api_key>`.
- API_KEY needs to be in format `service_id:<api_key>`.

# Queries

# Request Distribution

```
select rounded, count(id) from (
 select round(duration/1000/1000) as rounded, id from traces
) as tracesDurations
group by rounded
order by count;
```

# Round date fn

```
CREATE FUNCTION date_round(base_date timestamptz, round_interval interval)
    RETURNS timestamptz AS $BODY$
SELECT '1970-01-01'::timestamptz
    + (EXTRACT(epoch FROM $1)::integer + EXTRACT(epoch FROM $2)::integer / 2)
    / EXTRACT(epoch FROM $2)::integer
    * EXTRACT(epoch FROM $2)::integer * interval '1 second';
$BODY$ LANGUAGE SQL STABLE;
```

# Request latency over time

```
TODO
with generate_series(NOW() - INTERVAL '1 DAY', NOW(), INTERVAL '15 minute') as timestamps
select rounded, count(id) from (
 select date_round("startTime", '15 minutes') as rounded, id from traces
  join timestamps on timestamps = date_round
) as tracesDurations
group by rounded
order by count;
```

# Request rate over time (RPM)

```
with series as (
  select interval from generate_series(date_round(NOW(), '15 minutes') - INTERVAL '1 DAY', date_round(NOW(), '15 minutes'), INTERVAL '15 minute') as interval
)

SELECT count(*), interval
FROM series
left outer JOIN traces on date_round("startTime", '15 minutes') = interval
group by interval
order by interval;
```
