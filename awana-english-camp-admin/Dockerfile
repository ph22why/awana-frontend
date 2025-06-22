# Build stage
FROM node:16-alpine AS builder

WORKDIR /app

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV SKIP_PREFLIGHT_CHECK=true

# Copy package files first for better caching
COPY package*.json ./

# Remove node_modules and package-lock.json to ensure clean install
RUN rm -rf node_modules package-lock.json

# Install compatible ajv version first, then other dependencies
RUN npm cache clean --force && \
    npm install ajv@6.12.6 ajv-keywords@3.5.2 --legacy-peer-deps && \
    npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Create nginx config for React app
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 