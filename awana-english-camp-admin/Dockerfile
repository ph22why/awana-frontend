# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove package-lock.json and node_modules to force fresh install
RUN rm -f package-lock.json && rm -rf node_modules

# Clean npm cache and install dependencies with force and legacy peer deps
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --force --no-audit --no-fund --no-optional

# Copy source code
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV REACT_APP_BACKEND_HOST=https://awanaevent.com
ENV PUBLIC_URL=/
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true

# Build the app with increased memory limit and error handling
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build || (echo "Build failed, checking for common issues..." && ls -la && npm run build)

# List build contents for debugging
RUN ls -la /app/build/

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files to nginx html root
COPY --from=build /app/build /usr/share/nginx/html

# Verify files are copied
RUN ls -la /usr/share/nginx/html/

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 