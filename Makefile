default:
	sh env.sh admin
	docker compose up -d
down:
	docker compose down
	docker system prune -a
r:
	sh env.sh admin
	NODE_ENV=production npm run build
	node .next/standalone/server.js &