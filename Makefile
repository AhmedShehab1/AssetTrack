SHELL := /bin/bash

.PHONY: db backend frontend dev

db:
	docker-compose up -d

backend:
	if [[ -f .env ]]; then source scripts/load-env.sh; fi; \
	bash backend/scripts/ensure-rsa-keys.sh; \
	cd backend && mvn spring-boot:run

frontend:
	cd frontend && npm install && npm run dev

dev: backend
