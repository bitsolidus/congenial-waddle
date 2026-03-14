# Uploads Persistence - No .env Changes Required

## ✅ Solution Implemented

Your uploads folder will now persist across redeployments **without any changes to your Hostinger .env file**.

---

## What Changed

### docker-compose.yml

Added a Docker volume mount:

```yaml
backend:
  volumes:
    # Persist uploads outside container - survives redeployment
    - ./uploads:/app/backend/uploads
```

### How It Works

1. **Docker stores uploads on the host machine** at `/path/to/project/uploads`
2. **Container accesses them** at `/app/backend/uploads`
3. **When you redeploy**, Docker rebuilds the container but the host folder stays intact
4. **Files survive** container destruction and recreation

---

## Deployment on Hostinger

### Step 1: SSH into Your VPS
```bash
ssh u490008804@your-server-ip
```

### Step 2: Navigate to Project
```bash
cd /path/to/congenial-waddle
```

### Step 3: Create uploads directory (if it doesn't exist)
```bash
mkdir -p uploads
chmod 755 uploads
```

### Step 4: Update Docker
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### Step 5: Verify It's Working
```bash
# Check volume is mounted
docker inspect bitsolidus-backend | grep -A 10 "Mounts"

# Should show:
# "Source": "/path/to/congenial-waddle/uploads",
# "Destination": "/app/backend/uploads"
```

---

## Test Upload Persistence

### Before Redeploy:
1. Upload a test image via admin panel
2. Note the filename
3. Check it exists:
   ```bash
   ls -la uploads/
   ```

### Redeploy:
```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### After Redeploy:
1. Check file still exists:
   ```bash
   ls -la uploads/
   ```
2. File should still be there! ✅

---

## No .env Changes Needed

✅ **You don't need to add UPLOADS_DIR to Hostinger .env**  
✅ **No environment variables required**  
✅ **Works with default configuration**  

The backend code automatically uses `/app/backend/uploads` inside the container, which Docker maps to the persistent `./uploads` folder on your server.

---

## Why This Works

- **Docker volumes** store data outside containers
- **Host folder** (`./uploads`) persists even when container is destroyed
- **Container just mounts** the existing folder on startup
- **Zero configuration** needed in .env files

---

## Benefits

✅ **Simple**: Just add volume mount to docker-compose.yml  
✅ **Safe**: Files survive container rebuilds  
✅ **No .env changes**: Works with existing configuration  
✅ **Standard**: This is how Docker handles persistent data  
✅ **Portable**: Works on any Docker setup  

---

## Troubleshooting

### Issue: Uploads directory not created

**Fix:**
```bash
mkdir -p uploads
chmod 755 uploads
docker-compose restart backend
```

### Issue: Permission denied when uploading

**Fix:**
```bash
chmod 755 uploads
chown -R $(whoami) uploads
docker-compose restart backend
```

### Issue: Files not persisting

**Check volume is mounted:**
```bash
docker inspect bitsolidus-backend | grep -A 5 "Mounts"
```

Should show:
```
"Mounts": [
    {
        "Type": "bind",
        "Source": "/path/to/congenial-waddle/uploads",
        "Destination": "/app/backend/uploads",
        ...
    }
]
```

---

## Summary

**Before this fix:**
- ❌ Files stored inside container
- ❌ Lost on every `docker-compose build`
- ❌ Had to re-upload after each deployment

**After this fix:**
- ✅ Files stored on host machine
- ✅ Survive container rebuilds
- ✅ Zero .env changes required

---

**Status:** Ready to deploy  
**Last Updated:** 2026-03-13  
**Requires:** Only docker-compose.yml change
