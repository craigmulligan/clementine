ARGS := $(filter-out $(KNOWN_TARGETS),$(MAKECMDGOALS))

test:
	docker-compose run server npm test $(ARGS)

ci:
	docker-compose run server npm ci

build:
	docker-compose build

dev:
	docker-compose up
