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

# Debug: Show source files
RUN echo "=== Source files ===" && ls -la /app/src/

# Build the app with detailed error output
RUN echo "=== Starting React build ===" && \
    NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | tee /tmp/build.log || \
    (echo "=== Build failed, showing error log ===" && cat /tmp/build.log && exit 1)

# Debug: Check if build directory was created
RUN echo "=== Build directory check ===" && ls -la /app/

# List build contents for debugging
RUN echo "=== Build contents ===" && \
    if [ -d "/app/build" ]; then \
        ls -la /app/build/; \
        echo "=== Build files count ==="; \
        find /app/build -type f | wc -l; \
    else \
        echo "Build directory not found!"; \
        exit 1; \
    fi

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Remove default nginx config and default html
RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files to nginx html root (check if build exists first)
COPY --from=build /app/build /usr/share/nginx/html

# Verify files are copied
RUN echo "=== Final nginx html contents ===" && ls -la /usr/share/nginx/html/ && \
    echo "=== File count ===" && find /usr/share/nginx/html -type f | wc -l

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 