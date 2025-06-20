# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean npm cache and install dependencies with force and legacy peer deps
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --force --no-audit --no-fund

# Copy source code
COPY . .

# Set environment variables for production build
ENV NODE_ENV=production
ENV REACT_APP_BACKEND_HOST=https://awanaevent.com
ENV PUBLIC_URL=/tntcamp/admin
ENV GENERATE_SOURCEMAP=false

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