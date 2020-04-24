# Clementine

> Graphql Analytics and Observability Platform

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

NB you need to setup smpt for logins. (See .env for required fields).

```sh
psql postgres://user:pass@localhost:5432/db
```

`npm run migrate` will run the migrations.

`npm run migrate:down` will roll back the migrations.

`npm run migrate:create <migration-name>` will create a new migration file in [./src/migrations](./src/migrations).

# TODO:

- Use redis for queues [server]
- Forward to apollo-engine [server]
- Add deployment instructions helm chart? [server]

# RoadMap

- Add extra filters for cache hits etc.
- Filter by different percentiles.
- Team/Org support.
- Add error distribution views.
- Add error distribution views.
