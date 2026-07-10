# docker build -t ff .
# docker run -p 3000:3000 -it ff
# Build stage
FROM --platform=$BUILDPLATFORM node:24.15.0-alpine3.23 AS builder
WORKDIR /gen3

# Copy root manifests first to maximize npm install cache hits
COPY package.json package-lock.json lerna.json ./

# Copy only package manifests (not source) from each workspace so that
# npm ci is only re-run when dependencies change, not on source changes
COPY packages/core/package.json        packages/core/
COPY packages/frontend/package.json    packages/frontend/
COPY packages/tools/package.json       packages/tools/
COPY packages/sampleCommons/package.json packages/sampleCommons/
COPY packages/workspaces/package.json  packages/workspaces/

# Install dependencies using the locked versions from package-lock.json.
# lerna is in devDependencies so no global install is needed.
# Cache mount avoids re-downloading packages on repeated builds.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=optional

# Copy source after install so the install layer stays cached on source-only changes
COPY packages ./packages

# Build only sampleCommons and its dependencies — storybook/workspaces are not needed
RUN NODE_OPTIONS="--max-old-space-size=4096" \
    ./node_modules/.bin/lerna run build \
    --scope=@gen3/samplecommons \
    --include-dependencies

# ─────────────────────────────────────────────
# Production stage
FROM node:24.15.0-alpine3.23 AS runner

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

# Copy jupyter assets only if they exist in the builder stage
RUN --mount=from=builder,source=/gen3/packages/sampleCommons,target=/tmp/sampleCommons,readonly \
    if [ -d /tmp/sampleCommons/jupyter-workspaces ]; then \
      mkdir -p ./packages/sampleCommons; \
      cp -a /tmp/sampleCommons/jupyter-workspaces ./packages/sampleCommons/jupyter-workspaces; \
      chown -R nextjs:nextjs ./packages/sampleCommons/jupyter-workspaces; \
    fi

# Copy runtime script directly from build context (no need to stage through builder)
COPY --chown=nextjs:nextjs start.sh ./start.sh

# Prepare mount points for config and public assets
#VOLUME /gen3/config
#VOLUME /gen3/public

# Point app config/public to external volumes
RUN ln -s ./packages/sampleCommons/config  /gen3/config \
    && ln -s ./packages/sampleCommons/public /gen3/public

USER nextjs:nextjs

CMD ["sh", "./start.sh"]
