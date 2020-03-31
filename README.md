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
