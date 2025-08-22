# Development server (no build)
FROM node:18-alpine

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
ENV PUBLIC_URL=/bt

# Copy package files first for better caching
COPY package*.json ./

# Remove node_modules and package-lock.json to ensure clean install
RUN rm -rf node_modules package-lock.json yarn.lock

# Use npm install
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 80

# Start development server
CMD ["npm", "start"]
