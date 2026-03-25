.PHONY: help db-up db-down db-restart db-logs db-shell db-reset migrate generate push studio dev build start dev-bun dev-npm build-bun build-npm

# Detect package manager: prefer bun if available, otherwise use npm
PM := $(shell command -v bun >/dev/null 2>&1 && echo bun || echo npm)

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Package manager: $(PM)'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

db-up: ## Start the PostgreSQL database
	docker compose up -d postgres
	@echo "Waiting for database to be ready..."
	@sleep 3
	@echo "Database is ready!"

db-down: ## Stop the PostgreSQL database
	docker compose down

db-restart: ## Restart the PostgreSQL database
	docker compose restart postgres

db-logs: ## View database logs
	docker compose logs -f postgres

db-shell: ## Open a PostgreSQL shell
	docker compose exec postgres psql -U postgres -d expense_tracker

db-reset: ## Reset the database (WARNING: This will delete all data!)
	docker compose down -v
	docker compose up -d postgres
	@sleep 3
	@echo "Database reset complete. Run 'make migrate' to apply migrations."

migrate: ## Run database migrations
	$(PM) run db:migrate

generate: ## Generate Prisma client
	@if command -v bun >/dev/null 2>&1; then \
		bunx prisma generate; \
	else \
		npx prisma generate; \
	fi

migrate-dev: ## Run prisma migrate dev (creates new migration)
	$(PM) run db:generate

push: ## Push schema changes to database (dev only)
	$(PM) run db:push

studio: ## Open Prisma Studio
	$(PM) run db:studio

dev: ## Start the development server (uses bun if available, otherwise npm)
	$(PM) run dev

dev-bun: ## Start the development server with bun explicitly
	bun run dev

dev-npm: ## Start the development server with npm explicitly
	npm run dev

build: ## Build the application (uses bun if available, otherwise npm)
	$(PM) run build

build-bun: ## Build the application with bun explicitly
	bun run build

build-npm: ## Build the application with npm explicitly
	npm run build

start: ## Start the production server (uses bun if available, otherwise npm)
	$(PM) run start

setup: db-up push generate ## Initial setup: start DB, push schema, and generate Prisma client
	@echo "Setup complete! Database is running, schema is pushed, and Prisma client is generated."

