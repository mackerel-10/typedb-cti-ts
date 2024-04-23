#DC = docker compose

all: run

run:
	docker compose up
	npm run dev

down:
	docker compose down --rmi all