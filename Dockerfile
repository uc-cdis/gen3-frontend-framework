# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM node:20-slim AS builder
WORKDIR /gen3

# Copy package files first to leverage cache
#COPY package*.json lerna.json ./
#COPY packages/core/package.json ./packages/core/
#COPY packages/tools/package.json ./packages/tools/
#COPY packages/frontend/package.json ./packages/frontend/
#COPY packages/sampleCommons/package.json ./packages/sampleCommons/
COPY ./ ./

# Install dependencies
RUN npm install --location=global lerna@^8.1.8 && npm ci --include=optional


# Install additional dependencies
RUN npm install  \
RUN npm run build

COPY start.sh ./

# Build packages
RUN lerna run --scope @gen3/core build && \
    lerna run --scope @gen3/frontend build && \
    lerna run --scope @gen3/toolsff build && \
    lerna run --scope @gen3/samplecommons build

# Production stage
FROM node:20.18.2-alpine3.20 AS runner
RUN apk add bash
WORKDIR /gen3

RUN addgroup --system --gid 1001 nextjs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /gen3/packages/sampleCommons/public ./public
COPY --from=builder /gen3/packages/sampleCommons/.next/standalone/packages/sampleCommons ./.next
COPY --from=builder /gen3/start.sh ./start.sh
RUN chown -R nextjs:nextjs /gen3/.next
VOLUME /gen3/.next
VOLUME /config

USER nextjs:nextjs
ENV PORT=3000
CMD bash ./start.sh
