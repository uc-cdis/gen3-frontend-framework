# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM --platform=$BUILDPLATFORM node:krypton-trixie-slim AS builder
WORKDIR /gen3

WORKDIR /gen3

# 1. Install only what is needed for dependency installation & build
# Copy only package manifests first to maximize Docker cache
COPY package.json package-lock.json lerna.json ./
COPY packages ./packages

# Install lerna globally and dependencies (using CI-friendly, deterministic install)
RUN npm install --location=global lerna@^9.0.3 \
    && npm ci --include=optional

# Build monorepo (including sampleCommons)
RUN NODE_OPTIONS="--max-old-space-size=4096" lerna run build

# If start.sh is needed only at runtime, don't keep it here.
# If you need it for build, copy it here and later again to runtime:
COPY start.sh ./start.sh

# ─────────────────────────────────────────────
# Production stage
FROM node:krypton-trixie-slim AS runner

WORKDIR /gen3

# Create non-root user
RUN addgroup --system --gid 1001 nextjs \
    && adduser --system --uid 1001 nextjs

ENV NODE_ENV=production \
    PORT=3000

# Copy only what is required to run the built app
# If your Next.js standalone output already contains node_modules,
# you usually don't need a separate node_modules copy.
COPY --from=builder --chown=nextjs:nextjs /gen3/packages/sampleCommons/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /gen3/packages/sampleCommons/.next/static \
  ./packages/sampleCommons/.next/static
COPY --from=builder --chown=nextjs:nextjs /gen3/packages/sampleCommons/config ./packages/sampleCommons/config
COPY --from=builder --chown=nextjs:nextjs /gen3/packages/sampleCommons/public ./packages/sampleCommons/public


# Copy runtime script
COPY --from=builder --chown=nextjs:nextjs /gen3/start.sh ./start.sh

# Prepare mount points for config and public assets
#VOLUME /gen3/config
#VOLUME /gen3/public

# Point app config/public to external volumes
RUN ln -s ./packages/sampleCommons/config  /gen3/config \
    && ln -s ./packages/sampleCommons/public /gen3/public

USER nextjs:nextjs

CMD ["bash", "./start.sh"]
