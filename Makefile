.PHONY: help dev prod build clean migrate shell logs

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development
dev: ## Start development environment
	docker-compose up -d

dev-build: ## Build and start development environment
	docker-compose up --build -d

dev-logs: ## View development logs
	docker-compose logs -f

dev-stop: ## Stop development environment
	docker-compose down

# Production
prod: ## Start production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build: ## Build and start production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

prod-stop: ## Stop production environment
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Database
migrate: ## Run database migrations
	docker-compose exec backend alembic upgrade head

migrate-create: ## Create a new migration (usage: make migrate-create m="message")
	docker-compose exec backend alembic revision --autogenerate -m "$(m)"

migrate-reset: ## Reset database
	docker-compose exec backend alembic downgrade base
	docker-compose exec backend alembic upgrade head

# Utilities
shell: ## Open backend shell
	docker-compose exec backend /bin/bash

shell-python: ## Open Python shell in backend
	docker-compose exec backend python

logs: ## View all logs
	docker-compose logs -f

logs-backend: ## View backend logs
	docker-compose logs -f backend

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

clean: ## Remove all containers, volumes, and images
	docker-compose down -v --remove-orphans
	docker-compose down --rmi all

# Testing
test: ## Run backend tests
	docker-compose exec backend pytest

test-cov: ## Run backend tests with coverage
	docker-compose exec backend pytest --cov=app

# Frontend
frontend-dev: ## Start frontend development server locally
	cd frontend && npm run dev

frontend-build: ## Build frontend for production
	cd frontend && npm run build

# Install
install: ## Install all dependencies
	npm install
	cd frontend && npm install

install-backend: ## Install backend Python dependencies
	cd backend && pip install -r requirements.txt

# Linting
lint: ## Run all linters
	cd frontend && npm run lint
	cd backend && flake8 app

format: ## Format all code
	cd frontend && npx prettier --write src/
	cd backend && black app && isort app
