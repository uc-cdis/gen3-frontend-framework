# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM node:20-slim AS builder

# Build arguments and environment variables
ARG NODE_VERSION=20
ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME

WORKDIR /gen3

# Copy package files first to leverage cache
COPY package*.json lerna.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/tools/package.json ./packages/tools/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/sampleCommons/package.json ./packages/sampleCommons/

# Install dependencies
RUN npm ci

# Install additional dependencies
RUN npm install -g "lerna"
RUN npm install \
    "@swc/core" \
    "@napi-rs/magic-string" \
    "@rollup"

# Copy source code
COPY packages ./packages
COPY start.sh ./

# Build packages
RUN lerna run --scope @gen3/core build && \
    lerna run --scope @gen3/frontend build && \
    lerna run --scope @gen3/toolsff build && \
    lerna run --scope @gen3/samplecommons build

# Production stage
FROM node:20-slim AS runner

WORKDIR /gen3

# Create non-root user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder /gen3/node_modules ./node_modules
COPY --from=builder /gen3/packages/sampleCommons/config ./config
COPY --from=builder /gen3/packages/sampleCommons/public ./public
COPY --from=builder /gen3/packages/sampleCommons/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /gen3/packages/sampleCommons/.next ./.next
COPY --from=builder /gen3/start.sh /gen3/packages/sampleCommons/package.json ./
# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application using bash
CMD ["/bin/bash", "./start.sh"]
