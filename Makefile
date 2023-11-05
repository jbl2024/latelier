# Define default shell
SHELL := /bin/bash

# Local commands
start:
	npm run start

start-dev:
	npm run start-dev

test:
	npm run test

test-run:
	npm run test-run

test-app:
	npm run test-app

visualize:
	npm run visualize

lint:
	npm run lint

pretest:
	npm run pretest

# Docker commands
docker-start-dev:
	docker-compose --file docker-compose.dev.yml exec app npm run start-dev

docker-test:
	docker-compose --file docker-compose.dev.yml exec app npm run test

docker-test-run:
	docker-compose --file docker-compose.dev.yml exec app npm run test-run

docker-test-app:
	docker-compose --file docker-compose.dev.yml exec app npm run test-app

docker-visualize:
	docker-compose --file docker-compose.dev.yml exec app npm run visualize

docker-lint:
	docker-compose --file docker-compose.dev.yml exec app npm run lint

docker-pretest:
	docker-compose --file docker-compose.dev.yml exec app npm run pretest

docker-up:
	docker-compose --file docker-compose.dev.yml up --build

# Add a help command to list available targets
help:
	@echo "Available commands:"
	@echo "  start       Run the app locally with development settings and MAIL_URL"
	@echo "  start-dev   Run the app locally for development"
	@echo "  test        Run local tests once"
	@echo "  test-run    Continuously run local tests"
	@echo "  test-app    Run full-app local tests"
	@echo "  visualize   Visualize local production bundle"
	@echo "  lint        Lint the local codebase"
	@echo "  pretest     Run lint as pretest locally"
	@echo ""
	@echo "  docker-start-dev  Start the development environment in Docker"
	@echo "  docker-test       Run tests in the Docker container"
	@echo "  docker-test-run   Continuously run tests in the Docker container"
	@echo "  docker-test-app   Run full-app tests in the Docker container"
	@echo "  docker-visualize  Visualize production bundle in Docker"
	@echo "  docker-lint       Lint the codebase in Docker"
	@echo "  docker-pretest    Run lint as pretest in Docker"
	@echo "  docker-up         Start docker dev venv"

.PHONY: start start-dev test test-run test-app visualize lint pretest docker-start-dev docker-test docker-test-run docker-test-app docker-visualize docker-lint docker-pretest docker-up help
