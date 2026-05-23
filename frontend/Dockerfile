# Frontend: React + Vite + Tailwind
# Multi-stage build for production

# Stage 1: Builder
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build


# Stage 2: Runtime (nginx)
FROM nginx:alpine

# Copy nginx config for SPA routing
RUN echo 'server {\n  listen 80;\n  location / {\n    root /usr/share/nginx/html;\n    try_files $uri $uri/ /index.html;\n  }\n  location /api/ {\n    proxy_pass http://backend:8000;\n  }\n}' > /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]