default:
	sh env.sh admin
	docker compose up -d
down:
	docker compose down
	docker system prune -a