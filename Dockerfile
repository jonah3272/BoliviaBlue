# Multi-stage build for Bolivia Blue con Paz

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Backend runtime
FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1); })"

# Start server
CMD ["node", "server.js"]

