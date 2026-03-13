#!/bin/bash
# Complete fix for BitSolidus deployment

echo "=== Stopping conflicting containers ==="
# Stop Stalwart completely (we'll recreate without 443)
docker stop stalwart-mail 2>/dev/null
docker rm stalwart-mail 2>/dev/null

# Stop any old BitSolidus containers
docker ps -q --filter "name=x8og" | xargs -r docker stop
docker ps -aq --filter "name=x8og" | xargs -r docker rm

echo "=== Checking ports ==="
echo "Port 80:"
sudo ss -tlnp | grep :80 | head -2
echo ""
echo "Port 443:"
sudo ss -tlnp | grep :443 | head -2

echo ""
echo "=== Recreating Stalwart without HTTPS port ==="
mkdir -p /opt/stalwart-mail
cd /opt/stalwart-mail

cat > docker-compose.yml << 'EOF'
services:
  stalwart-mail:
    image: stalwartlabs/mail-server:v0.9.0
    container_name: stalwart-mail
    restart: unless-stopped
    ports:
      # Email ports only (NO 80/443 web ports)
      - "25:25"
      - "587:587"
      - "465:465"
      - "143:143"
      - "993:993"
      - "110:110"
      - "995:995"
      - "4190:4190"
      # Web admin on port 8090 only
      - "8090:8080"
    volumes:
      - ./data:/opt/stalwart-mail/data
    environment:
      - STALWART_DOMAIN=mail.bitsolidus.io
EOF

docker compose up -d

echo ""
echo "=== Checking final state ==="
docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E '(stalwart|coolify-proxy|x8og)'

echo ""
echo "=== Done! ==="
echo "Stalwart mail: http://mail.bitsolidus.io:8090"
echo "Now go to Coolify and redeploy BitSolidus"
