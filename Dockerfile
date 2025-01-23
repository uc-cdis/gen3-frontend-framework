# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM quay.io/cdis/ubuntu:20.04 AS builder

# Build arguments and environment variables
ARG NODE_VERSION=20
ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl1.1 \
    libgnutls30 \
    ca-certificates \
    curl \
    git \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install -g npm \
    && npm install -g lerna@8.1.8 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /gen3

# Copy package files first to leverage cache
COPY package*.json lerna.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/tools/package.json ./packages/tools/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/sampleCommons/package.json ./packages/sampleCommons/

# Install dependencies
RUN npm ci --include=optional

# Install additional dependencies
RUN npm install \
    "@swc/core" \
    "@napi-rs/magic-string" \
    "@rollup/rollup-linux-x64-gnu"

# Copy source code
COPY packages ./packages
COPY start.sh ./

# Build packages
RUN lerna run --scope @gen3/core build && \
    lerna run --scope @gen3/frontend build && \
    lerna run --scope @gen3/toolsff build && \
    lerna run --scope @gen3/samplecommons build

# Production stage
FROM node:20.18.1-alpine3.20 AS production

WORKDIR /gen3

# Create non-root user
RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

# Copy built artifacts from builder
COPY --from=builder --chown=nextjs:nextjs /gen3 .
RUN apk add --no-cache bash
# Set environment variables
ENV PORT=3000
ENV NODE_ENV=production

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start the application using bash
CMD ["/bin/bash", "./start.sh"]
