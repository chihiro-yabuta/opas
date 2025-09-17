default:
	sh env.sh admin
	docker compose up -d
down:
	docker compose down
	docker system prune -a
r:
	sh env.sh admin
	NODE_ENV=production npm run build
	HOSTNAME=127.0.0.1 PORT=3000 node .next/standalone/server.js &

# sudo dnf install -y nginx git make
# sudo dnf module install -y nodejs:22
# sudo setsebool -P httpd_can_network_connect on
# sudo systemctl enable --now nginx
# cp nginx.conf /etc/nginx/conf.d/app.conf
# sudo nginx -t && sudo systemctl reload nginx