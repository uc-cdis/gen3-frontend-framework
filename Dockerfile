# docker build -t gen3:fef .
# docker run -p 3000:3000 -it gen3:fef
# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────
# JupyterLite stage — independent of the TypeScript build.
# It only needs the static config/scripts from packages/workspaces, so it is
# cached separately and BuildKit runs it in parallel with the `builder` stage.
FROM node:24.22.1-alpine3.23 AS lite

# Python, bash, and curl for the JupyterLite build.
# No real micromamba binary needed — see stub below.
RUN apk add --no-cache python3 py3-pip bash curl bzip2 uv git coreutils

# Stub that satisfies prepare_wasm.js without the glibc-linked micromamba binary.
COPY docker/micromamba-stub.py /usr/local/bin/micromamba
RUN chmod +x /usr/local/bin/micromamba

# Download cockle WASM packages from emscripten-forge so prepare_wasm.js reuses
# the existing env instead of running micromamba create. prepare_wasm.js is
# invoked with cwd=lite_dir, so the env must live inside the remote tier's
# `--lite-dir` (jupyterlite-builds/remote-private) — otherwise its relative
# `./cockle_wasm_env` lookup misses. Only the remote tier is downloaded here.
# Independent of source, so this layer stays cached.
ENV LITE_ROOT=/lite/jupyterlite-builds
RUN WASM_ENV=${LITE_ROOT}/remote-private/cockle_wasm_env && \
    mkdir -p "$WASM_ENV" && \
    for URL in \
      "https://repo.prefix.dev/emscripten-forge-4x/emscripten-wasm32/cockle_fs-0.3.0-h8b79025_1.tar.bz2" \
      "https://repo.prefix.dev/emscripten-forge-4x/emscripten-wasm32/coreutils-9.10-h072c4ef_2.tar.bz2" \
      "https://repo.prefix.dev/emscripten-forge-4x/emscripten-wasm32/grep-3.12-h8b79025_0.tar.bz2" \
      "https://repo.prefix.dev/emscripten-forge-4x/emscripten-wasm32/less-693-hf259948_0.tar.bz2" \
      "https://repo.prefix.dev/emscripten-forge-4x/emscripten-wasm32/sed-4.9-h072c4ef_0.tar.bz2" \
    ; do \
      curl -fsSL "$URL" | tar -xj -C "$WASM_ENV"; \
    done

# Mirror the layout of packages/workspaces/dist/jupyterlite-builds (what the
# rollup copy step produces) straight from the sources.
COPY packages/workspaces/jupyterlite-builds/ ${LITE_ROOT}/
COPY packages/workspaces/scripts/*.sh ${LITE_ROOT}/scripts/

# Equivalent to `npm run build:jupyterlite` in packages/sampleCommons; the
# output lands in ./jupyter-workspaces (default PKG_DIR of the sync script).
WORKDIR /lite/work
RUN --mount=type=cache,target=/root/.cache/uv \
    S=${LITE_ROOT}/scripts && \
    bash $S/setup-env.sh ./builds && \
    bash $S/build-gen3sdk-lite.sh ./builds && \
    bash $S/build-jupyterlite.sh free ./builds && \
    bash $S/build-jupyterlite.sh remote ./builds && \
    bash $S/sync-jupyter-assets-into-package.sh ./builds

# ─────────────────────────────────────────────
# Build stage
FROM --platform=$BUILDPLATFORM node:24.22.1-alpine3.23 AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM
ARG TARGETARCH
# Set to 1 to ship browser source maps (adds ~70MB to the image and slows the build)
ARG GEN3_SOURCE_MAPS=0
ENV GEN3_SOURCE_MAPS=${GEN3_SOURCE_MAPS}
WORKDIR /gen3

RUN apk add --no-cache git

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
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm ci --include=optional

# Copy source after install so the install layer stays cached on source-only changes
COPY packages ./packages

# Build the library packages once (tools, core, frontend, workspaces).
RUN npm run build:pkg

# Build only the Next.js app. The libraries are already built above, so do NOT
# use `lerna run build --include-dependencies` (that rebuilt them a second time).
# `npm run -w` runs sampleCommons' prebuild hook (scanSitePaths) + `next build`.
# The .next/cache mount keeps webpack's incremental cache between image builds.
RUN --mount=type=cache,target=/gen3/packages/sampleCommons/.next/cache \
    NODE_OPTIONS="--max-old-space-size=4096" \
    npm run build --workspace=@gen3/samplecommons

# ─────────────────────────────────────────────
# Production stage
FROM node:24.22.1-alpine3.23 AS runner

WORKDIR /gen3

RUN apk add --no-cache curl

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
COPY --from=lite --chown=nextjs:nextjs /lite/work/jupyter-workspaces \
  ./packages/sampleCommons/jupyter-workspaces

# Copy runtime script directly from build context (no need to stage through builder)
COPY --chown=nextjs:nextjs start.sh ./start.sh

# Prepare mount points for config and public assets
#VOLUME /gen3/config
#VOLUME /gen3/public

# Point app config/public to external volumes
RUN ln -s ./packages/sampleCommons/config  /gen3/config \
    && ln -s ./packages/sampleCommons/public /gen3/public \
    && ln -s ./packages/sampleCommons/jupyter-workspaces /gen3/jupyter-workspaces

USER nextjs:nextjs

CMD ["sh", "./start.sh"]
