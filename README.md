# Clementine

> Graphql Analytics and Observability Platform

## Setup

Add all required environment variables in `.env`.

Then:

```
make dev
```

Or for production:

```
make start
```

The frontend will now be served on localhost:80. Postgres is exposed on port `5432`. The connection string is `postgres://user:pass@localhost:35432/db` (username, password and database name are defined in [./docker-compose.yaml](./docker-compose.yaml)).

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
