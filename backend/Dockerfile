FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Create uploads directory with proper permissions
# This ensures the directory exists even if volume mount fails
RUN mkdir -p /app/uploads/kyc && chmod -R 777 /app/uploads

# Expose port
EXPOSE 5000

# Ensure uploads directory exists and start the application
CMD sh -c "node scripts/ensure-uploads-dir.js && node server.js"
