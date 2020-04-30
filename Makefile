ARGS := $(filter-out $(KNOWN_TARGETS),$(MAKECMDGOALS))

test:
	docker-compose run server npm test

test-debug:
	docker-compose run server node --inspect node_modules/.bin/jest --runInBand

ci:
	docker-compose run server npm ci

build:
	docker-compose -f docker-compose.yaml -f dev.yaml build

dev:
	docker-compose -f docker-compose.yaml -f dev.yaml up

migrate:
	docker-compose run server npm run migrate up

migrate-down:
	docker-compose run server npm run migrate down

db-rm:
	docker-compose kill postgres && docker-compose rm postgres

psql:
	psql postgres://user:pass@localhost:5432/db

build-prod:
	docker-compose -f docker-compose.yaml -f dev.yaml build

start: build-prod
	docker-compose -f docker-compose.yml -f production.yml up -d

