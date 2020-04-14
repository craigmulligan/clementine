ARGS := $(filter-out $(KNOWN_TARGETS),$(MAKECMDGOALS))

test:
	docker-compose run server npm test ./src/graphql

ci:
	docker-compose run server npm ci

build:
	docker-compose build

dev:
	docker-compose up

migrate:
	docker-compose run server npm run migrate up

migrate-down:
	docker-compose run server npm run migrate down

db-rm:
	docker-compose kill postgres && docker-compose rm postgres

psql:
	psql postgres://user:pass@localhost:5432/db
