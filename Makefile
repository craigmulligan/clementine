ARGS := $(filter-out $(KNOWN_TARGETS),$(MAKECMDGOALS))

test:
	docker-compose run server npm test

ci:
	docker-compose run server npm ci

build:
	docker-compose build

dev:
	MAX_DB_CONNECTIONS=10 docker-compose up

migrate:
	MAX_DB_CONNECTIONS=10 docker-compose run server npm run migrate
