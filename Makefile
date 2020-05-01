test:
	docker-compose run server npm test

ci:
	docker-compose run server npm ci

build:
	docker-compose -f docker-compose.yaml -f dev.yaml build

dev: build
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
	docker-compose -f docker-compose.yaml -f prod.yaml build

start: build-prod
	docker-compose -f docker-compose.yaml -f prod.yaml up -d

start_with_ssl: build-prod
	docker-compose -f docker-compose.yaml -f prod.yaml -f ssl.yaml up -d
