# Multi-stage Dockerfile for BitSolidus
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

# Accept build arguments
ARG VITE_API_URL

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend with API URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/ ./

# Stage 3: Production Image
FROM node:20-alpine

WORKDIR /app

# Install nginx for serving frontend
RUN apk add --no-cache nginx

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Note: uploads directory will be mounted via Docker volume
# No need to create it here - backend will create it on startup if needed

# Expose ports
EXPOSE 8080

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'nginx' >> /app/start.sh && \
    echo 'cd /app/backend && BACKEND_PORT=8080 node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start both nginx and backend
CMD ["/app/start.sh"]
