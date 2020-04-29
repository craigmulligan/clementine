# Clementine

> Graphql Analytics and Observability Platform

## Setup

Add all required envars from `.env`.

Then:

```
make dev
```

The frontend will now be served on localhost. Postgres is exposed on port `5432`. The connection string is `postgres://user:pass@localhost:35432/db` (username, password and database name are defined in [./docker-compose.yaml](./docker-compose.yaml)).

You can connect to Postgres using the psql client:

```sh
psql postgres://user:pass@localhost:5432/db
```

`make migrate` will run the migrations.

`make migrate-down` will roll back the migrations.

# TODO:

- Add deployment instructions helm chart? [server]
- next page on traces?

# RoadMap

- Add extra filters for cache hits etc.
- Filter by different percentiles.
- Team/Org support.
- Add error distribution views.
- Add error distribution views.
