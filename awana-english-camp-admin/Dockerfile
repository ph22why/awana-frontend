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
ENV PUBLIC_URL=/tntcamp/admin
ENV GENERATE_SOURCEMAP=false
ENV CI=false

# Build the app with increased memory limit
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM nginx:alpine

# Install curl for health check
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html/tntcamp/admin

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 