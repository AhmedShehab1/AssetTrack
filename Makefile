SHELL := /bin/bash

.PHONY: db backend frontend dev docker

db:
	docker-compose up -d postgres pgadmin

backend:
	source scripts/load-env.sh; \
	bash backend/scripts/ensure-rsa-keys.sh; \
	cd backend && mvn spring-boot:run

frontend:
	cd frontend && npm install && npm run dev

dev: backend

docker:
	docker-compose up -d
