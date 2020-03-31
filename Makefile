ARGS := $(filter-out $(KNOWN_TARGETS),$(MAKECMDGOALS))

test:
	MAX_DB_CONNECTIONS=1 docker-compose run server npm test

ci:
	docker-compose run server npm ci

build:
	docker-compose build

dev:
	MAX_DB_CONNECTIONS=10 docker-compose up

migrate:
	MAX_DB_CONNECTIONS=1 docker-compose run server npm run migrate up

migrate-down:
	MAX_DB_CONNECTIONS=1 docker-compose run server npm run migrate down

db-rm:
	docker-compose kill postgres && docker-compose rm postgres

psql:
	psql postgres://user:pass@localhost:5432/db
