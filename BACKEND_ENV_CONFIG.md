# Backend .env Configuration for Hostinger

## Your Production Setup
- **Backend Domain:** bitsolidus.tech (runs on port 8080)
- **Frontend Domain:** bitsolidus.io (hosted on Vercel)

---

## Required Environment Variables

Copy this to your `backend/.env` file on Hostinger:

```bash
# Server Configuration
PORT=8080
BACKEND_PORT=8080
NODE_ENV=production

# MongoDB Connection (REQUIRED - Get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/crypto_trading_platform?retryWrites=true&w=majority

# JWT Security
JWT_SECRET=generate_secure_random_string_here
JWT_EXPIRE=7d

# Admin Credentials
ADMIN_EMAIL=admin@bitsolidus.io
ADMIN_PASSWORD=YourSecurePassword123!

# Email Configuration (SendGrid)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here
FROM_EMAIL=noreply@bitsolidus.io
FROM_NAME=BitSolidus

# Blockchain RPC URLs
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
BSC_RPC_URL=https://bsc-dataseed.binance.org/
POLYGON_RPC_URL=https://polygon-rpc.com/

# Gas Settings
DEFAULT_GAS_MULTIPLIER=1.5
DEFAULT_GAS_LIMIT=21000

# Site URLs
BACKEND_URL=https://bitsolidus.tech
FRONTEND_URL=https://bitsolidus.io

# Uploads Directory
UPLOADS_DIR=/app/backend/uploads
```

---

## Where to Get Each Value

### 1. MongoDB URI
**Source:** https://cloud.mongodb.com/
1. Login to MongoDB Atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>` with actual values

**Example:**
```
mongodb+srv://admin:MyPassword123@cluster0.abc123.mongodb.net/crypto_trading_platform?retryWrites=true&w=majority
```

### 2. JWT Secret
**Generate locally:**
```bash
openssl rand -base64 32
```
Paste the output string

### 3. SendGrid API Key
**Source:** https://sendgrid.com/
1. Sign up and verify your domain
2. Create API key in Settings → API Keys
3. Copy the key (starts with `SG.`)

### 4. Infura Key (Optional but Recommended)
**Source:** https://infura.io/
1. Sign up for free account
2. Create new project
3. Copy the Project ID

---

## Deployment Steps on Hostinger

### Step 1: SSH into VPS
```bash
ssh u490008804@your-server-ip
```

### Step 2: Navigate to Backend
```bash
cd /path/to/congenial-waddle/backend
```

### Step 3: Edit .env File
```bash
nano .env
```

### Step 4: Paste Configuration
Copy the template above and replace all placeholder values

### Step 5: Save and Exit
- Press `Ctrl + X`
- Type `Y`
- Press `Enter`

### Step 6: Restart Docker
```bash
cd ..
docker-compose down
docker-compose build
docker-compose up -d
```

### Step 7: Check Logs
```bash
docker-compose logs -f backend
```

**Expected output:**
```
Server running on port 8080
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

---

## Verification Tests

### Test Health Endpoint
```bash
curl http://localhost:8080/api/health
```

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitsolidus.io","password":"YourSecurePassword123!"}'
```

---

## Important Notes

⚠️ **DO NOT commit `.env` to GitHub!**
- The `.env` file is already in `.gitignore`
- Only edit it directly on the server
- Never share your actual credentials

✅ **Security Best Practices:**
- Use strong, unique passwords
- Change admin password after first login
- Regularly rotate your JWT secret
- Keep SendGrid API key secure

---

## Troubleshooting

### Backend Won't Start
Check if MongoDB URI is correct and properly formatted

### Port Already in Use
```bash
sudo lsof -i :8080
sudo kill -9 <PID>
```

### Cannot Connect from Frontend
Ensure CORS is configured and firewall allows port 8080

---

**Status:** Ready for deployment  
**Last Updated:** 2026-03-13
