# Backend Port Configuration - Port 8080

## Summary

Backend server has been configured to run on **port 8080** instead of 5000.

---

## Files Modified

### 1. Dockerfile

**Changes:**
- Removed port 5000 from EXPOSE
- Updated startup script to use BACKEND_PORT=8080

```dockerfile
# Before
EXPOSE 8080 5000
...
echo 'cd /app/backend && BACKEND_PORT=5000 node server.js'

# After
EXPOSE 8080
...
echo 'cd /app/backend && BACKEND_PORT=8080 node server.js'
```

---

### 2. docker-compose.yml

**Changes:**
- Port mapping: `5000:5000` → `8080:8080`
- Environment variables: PORT=8080, BACKEND_PORT=8080
- Health check URL updated to port 8080

```yaml
backend:
  ports:
    - "8080:8080"
  environment:
    - NODE_ENV=production
    - PORT=8080
    - BACKEND_PORT=8080
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:8080/api/health"]
```

---

### 3. backend/.env.example

**Changes:**
- Updated PORT=8080
- Added BACKEND_PORT=8080

```bash
# Server Configuration
PORT=8080
BACKEND_PORT=8080
NODE_ENV=production
```

---

### 4. backend/server.js

**Already configured** to use environment variables:

```javascript
const PORT = process.env.BACKEND_PORT || process.env.PORT || 5000;
```

This will automatically use 8080 when the environment variables are set.

---

## Deployment Instructions

### On Production Server:

```bash
# 1. SSH into server
ssh your-server-ip

# 2. Navigate to project directory
cd /path/to/congenial-waddle

# 3. Update .env file (if not using docker-compose env vars)
nano backend/.env

# Add/update these lines:
PORT=8080
BACKEND_PORT=8080

# 4. Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d

# 5. Verify backend is running on port 8080
docker-compose ps
docker-compose logs -f backend
```

**Expected output:**
```
Server running on port 8080
MongoDB Connected: ...
```

---

## Testing

### Test Health Check

```bash
curl http://localhost:8080/api/health
# or from external
curl https://bitsolidus.tech:8080/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-13T..."
}
```

### Test Login API

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitsolidus.io","password":"your-password"}'
```

---

## Firewall Configuration

If you're behind a firewall, ensure port 8080 is open:

```bash
# UFW (Ubuntu)
sudo ufw allow 8080/tcp
sudo ufw reload

# firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=8080/tcp
sudo firewall-cmd --reload

# AWS Security Groups
# Add inbound rule for TCP port 8080
```

---

## Reverse Proxy Setup (Optional)

If using nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name bitsolidus.tech;

    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Issue: Port already in use

```bash
# Check what's using port 8080
sudo lsof -i :8080
# or
sudo netstat -tulpn | grep 8080

# Kill the process
sudo kill -9 <PID>
```

### Issue: Backend not starting

Check logs:
```bash
docker-compose logs backend
```

Common issues:
- MongoDB URI not set
- Port conflict
- Missing environment variables

### Issue: Cannot connect from frontend

Ensure frontend is configured to use correct API URL:

**Frontend .env:**
```
VITE_API_URL=https://bitsolidus.tech:8080
```

Or if using reverse proxy on standard port:
```
VITE_API_URL=https://bitsolidus.tech/api
```

---

## Environment Variables Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | 8080 | Server port |
| `BACKEND_PORT` | 8080 | Explicit backend port |
| `NODE_ENV` | production | Environment mode |
| `MONGODB_URI` | (your connection string) | Database connection |

---

## Verification Checklist

- [ ] Dockerfile updated to use port 8080
- [ ] docker-compose.yml port mapping changed to 8080
- [ ] Environment variables set to PORT=8080
- [ ] Backend container started successfully
- [ ] Logs show "Server running on port 8080"
- [ ] Health check returns OK on port 8080
- [ ] Frontend can connect to backend
- [ ] Firewall allows port 8080 (if needed)

---

## Rollback (If Needed)

To revert to port 5000:

```bash
# Edit files back to:
# Dockerfile: BACKEND_PORT=5000
# docker-compose.yml: ports: "5000:5000"
# .env: PORT=5000

docker-compose down
docker-compose build
docker-compose up -d
```

---

**Status:** ✅ Configured for port 8080  
**Last Updated:** 2026-03-13
