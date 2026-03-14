# Database Connection Troubleshooting Guide

## Issue: Backend Not Connecting to Database

### Symptoms
- Login not working
- Registration fails
- API returns errors
- Site appears broken

---

## Root Cause

**Empty `MONGODB_URI` in `.env` file**

The backend cannot connect to MongoDB because the connection string is missing or empty.

---

## Quick Fix

### Step 1: Get Your MongoDB Connection String

#### Option A: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Click "Connect" on your cluster
4. Choose "Connect your application"
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<database_name>?retryWrites=true&w=majority
   ```
6. Replace `<username>`, `<password>`, and `<database_name>` with your actual values

#### Option B: Self-Hosted MongoDB

If MongoDB is installed on your server:
```bash
mongodb://localhost:27017/crypto_trading_platform
```

Or with authentication:
```bash
mongodb://admin:your-password@localhost:27017/crypto_trading_platform?authSource=admin
```

---

### Step 2: Update Configuration

#### Method 1: Edit .env File (Recommended)

On your production server:

```bash
# SSH into server
ssh your-server-ip

# Navigate to backend directory
cd /path/to/congenial-waddle/backend

# Edit .env file
nano .env

# Add your MongoDB URI (replace with actual values):
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/crypto_trading_platform?retryWrites=true&w=majority

# Save (Ctrl+X, Y, Enter)
```

#### Method 2: Update docker-compose.yml

Edit `docker-compose.yml` and add to environment section:

```yaml
services:
  backend:
    environment:
      - MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/crypto_trading_platform?retryWrites=true&w=majority
```

---

### Step 3: Restart Backend

```bash
# From project root directory
docker-compose restart backend

# Or rebuild if you changed docker-compose.yml
docker-compose down
docker-compose build
docker-compose up -d
```

---

### Step 4: Verify Connection

```bash
# Check backend logs
docker-compose logs -f backend
```

**Expected output:**
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

**If you see errors:**
- Check MongoDB credentials
- Verify network access (Atlas IP whitelist)
- Ensure database name is correct

---

## Testing

### Test Login
```bash
curl -X POST https://bitsolidus.tech/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bitsolidus.io","password":"your-password"}'
```

**Expected response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Test Health Check
```bash
curl https://bitsolidus.tech/api/health
```

**Expected response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-13T..."
}
```

---

## Common Issues & Solutions

### Issue 1: "MongoNetworkError: failed to connect"

**Causes:**
- Wrong MongoDB URI
- MongoDB not running
- Firewall blocking connection

**Solutions:**
```bash
# Check MongoDB status (self-hosted)
sudo systemctl status mongod

# Check Atlas cluster status (cloud)
# Visit https://cloud.mongodb.com/

# Test connection locally
mongosh "your-mongodb-uri"
```

---

### Issue 2: "Authentication failed"

**Causes:**
- Wrong username/password
- Special characters in password not encoded

**Solutions:**
1. Verify credentials in MongoDB Atlas
2. URL-encode special characters in password:
   - `@` → `%40`
   - `#` → `%23`
   - `$` → `%24`
   - etc.

Example:
```bash
# Wrong (password has @ symbol)
MONGODB_URI=mongodb+srv://user:my@password@cluster...

# Correct (@ encoded as %40)
MONGODB_URI=mongodb+srv://user:my%40password@cluster...
```

---

### Issue 3: "IP not whitelisted" (Atlas only)

**Cause:** Server IP not allowed in Atlas

**Solution:**
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add your server's public IP
4. Or use `0.0.0.0/0` for testing (allow all)

---

### Issue 4: "Database not found"

**Cause:** Database doesn't exist yet

**Solution:**
MongoDB creates database on first write. Just try to register a user or insert data.

---

### Issue 5: Container can't reach MongoDB

**Cause:** Docker networking issue

**Solution:**
For self-hosted MongoDB, use host network or container name:

```yaml
# In docker-compose.yml
services:
  mongodb:
    image: mongo:latest
    container_name: bitsolidus-mongodb
  
  backend:
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://bitsolidus-mongodb:27017/crypto_trading_platform
```

---

## Environment Variables Reference

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster/db` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Backend server port |
| `NODE_ENV` | development | Environment mode |
| `UPLOADS_DIR` | ./backend/uploads | Uploads directory path |

---

## Security Best Practices

### 1. Use Environment Variables

Never commit `.env` to Git! Add to `.gitignore`:
```
.env
*.local
```

### 2. Use Strong Passwords

Generate secure MongoDB passwords:
```bash
# Generate random password
openssl rand -base64 32
```

### 3. Restrict Database Access

- Only allow specific IPs (Atlas)
- Use private networks (VPC)
- Enable authentication

### 4. Regular Backups

Set up automated backups:
- Atlas: Built-in backup feature
- Self-hosted: `mongodump` cron job

---

## Monitoring

### Check Database Status

```bash
# MongoDB Atlas
# Dashboard shows connection count, operations, etc.

# Self-hosted
mongosh
> db.stats()
> db.serverStatus()
```

### Monitor Connections

```bash
# In MongoDB shell
db.currentOp()
```

### Application Logs

```bash
# Docker logs
docker-compose logs -f backend

# Filter for database errors
docker-compose logs backend | grep -i "mongo\|error"
```

---

## Performance Optimization

### Connection Pooling

Default pool size is usually fine, but you can adjust:

```javascript
// backend/config/database.js
await mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10, // Increase for high traffic
  minPoolSize: 5,  // Keep minimum connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### Indexes

Ensure proper indexes exist:

```javascript
// Check indexes
db.users.getIndexes()

// Create index if missing
db.users.createIndex({ email: 1 }, { unique: true })
```

---

## Backup & Restore

### Backup

```bash
# MongoDB Atlas
# Automatic backups enabled in cluster settings

# Self-hosted
mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)
```

### Restore

```bash
mongorestore --uri="your-mongodb-uri" ./backup-20260313
```

---

## Checklist for Production

- [ ] MongoDB URI set in `.env` or `docker-compose.yml`
- [ ] Credentials tested and working
- [ ] IP whitelisted (if using Atlas)
- [ ] Database name specified
- [ ] Special characters in password encoded
- [ ] Backend restarted after configuration change
- [ ] Logs show successful connection
- [ ] Login/registration working
- [ ] Regular backups configured
- [ ] Monitoring enabled

---

## Need Help?

### Debug Script

Create `backend/debug-db.js`:

```javascript
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('MongoDB URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

if (!process.env.MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set!');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected successfully!');
  console.log('Database:', mongoose.connection.db.databaseName);
  await mongoose.disconnect();
  console.log('Disconnected.');
} catch (error) {
  console.error('❌ Connection failed:', error.message);
}
```

Run it:
```bash
cd backend
node debug-db.js
```

---

## Summary

**Problem:** Empty `MONGODB_URI`  
**Solution:** Add valid MongoDB connection string  
**Result:** ✅ Database connected, login works

**Files to update:**
1. `backend/.env` (on production server)
2. OR `docker-compose.yml` (environment variable)

**Verification:**
```bash
docker-compose logs backend | grep "MongoDB Connected"
```

---

**Last Updated:** 2026-03-13  
**Status:** Configuration template provided, awaiting actual MongoDB URI
