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

# Copy startup script
COPY start-backend.sh /app/start-backend.sh
RUN chmod +x /app/start-backend.sh

# Expose port
EXPOSE 5000

# Use the startup script to ensure directory exists before starting
CMD ["/app/start-backend.sh"]
