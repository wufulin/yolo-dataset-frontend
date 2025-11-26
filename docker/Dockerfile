# =============================================================================
# Usage
# =============================================================================
# Build production image:
# docker build -t yolo-frontend:latest \
#   --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
#   --build-arg NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000 \
#   .
#
# Run production container:
# docker run -d -p 3000:3000 \
#   -e NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 \
#   -e NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000 \
#   --name yolo-frontend \
#   yolo-frontend:latest
#
# Multi-stage build - Next.js frontend application
# =============================================================================
# Build stage
# =============================================================================
FROM node:20-alpine as builder

# Set build arguments
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_MINIO_ENDPOINT

# Set environment variables (NODE_ENV=production not set in build stage, devDependencies needed)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies, TypeScript needed for build)
RUN npm ci --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN npm run build

# =============================================================================
# Runtime environment
# =============================================================================
FROM node:20-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_MINIO_ENDPOINT=${NEXT_PUBLIC_MINIO_ENDPOINT}

# Copy standalone output from build stage (smaller image)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start command (using standalone mode server.js)
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
