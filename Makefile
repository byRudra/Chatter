.PHONY: up down logs ps test lint fmt clean

COMPOSE := docker compose

## up: build and start backend (:8000) and frontend (:3000)
up: .env
	$(COMPOSE) up --build -d
	@echo ""
	@echo "  Frontend  http://localhost:3000"
	@echo "  Backend   http://localhost:8000  (health: /health)"

## down: stop the stack (keeps the SQLite volume)
down:
	$(COMPOSE) down

## logs: follow logs from both services
logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

## test: run the backend test suite (needs backend deps installed)
test:
	cd backend && python -m pytest -q

lint:
	cd backend && ruff check . && ruff format --check .
	cd frontend && npm run typecheck

fmt:
	cd backend && ruff format . && ruff check --fix .

## clean: stop the stack and delete the SQLite volume
clean:
	$(COMPOSE) down -v

.env:
	cp .env.example .env
	@echo "Created .env from .env.example. Add your real LLM_API_KEYS before chatting."
