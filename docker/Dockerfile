# Dockerfile for React app (supports both dev and prod)
FROM node:18-alpine

# Install build dependencies including Python for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    linux-headers

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (skip optional dependencies to avoid native modules)
RUN npm install --legacy-peer-deps --omit=optional

# Copy all source code
COPY . .

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint to handle config setup
ENTRYPOINT ["/entrypoint.sh"]

# Start development server (will use hot reload with volume mounts)
CMD ["npm", "start"]