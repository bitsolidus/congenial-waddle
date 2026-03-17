FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source files
COPY . .

# Expose port
EXPOSE 5000

# Ensure uploads directory exists and start the application
CMD sh -c "node scripts/ensure-uploads-dir.js && node server.js"
