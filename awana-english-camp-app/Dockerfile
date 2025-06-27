# 1. Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Set memory limit for Node.js and disable problematic features
ENV NODE_OPTIONS="--max_old_space_size=4096"
ENV GENERATE_SOURCEMAP=false
ENV CI=false
ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV TSC_COMPILE_ON_ERROR=true
ENV HOST=0.0.0.0
ENV PORT=80
ENV PUBLIC_URL=/tntcamp

# Copy package files first for better caching
COPY package.json yarn.lock ./

# Remove node_modules and package-lock.json to ensure clean install
RUN rm -rf node_modules package-lock.json

# Use yarn instead of npm for better dependency resolution
RUN yarn cache clean && \
    yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN yarn build

# 2. Production stage
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 