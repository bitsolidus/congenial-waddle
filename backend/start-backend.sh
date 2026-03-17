#!/bin/sh
# Startup script for backend container
# Ensures uploads directory exists with proper permissions

echo "========================================"
echo "Starting backend container..."
echo "========================================"

# Create uploads directory if it doesn't exist
if [ ! -d "/app/uploads" ]; then
    echo "Creating /app/uploads directory..."
    mkdir -p /app/uploads/kyc
fi

# Ensure proper permissions (777 for development/testing)
echo "Setting permissions on /app/uploads..."
chmod -R 777 /app/uploads

# List directory contents for debugging
echo "Uploads directory contents:"
ls -la /app/uploads/

echo "========================================"
echo "Starting Node.js application..."
echo "========================================"

# Start the application
exec node server.js
