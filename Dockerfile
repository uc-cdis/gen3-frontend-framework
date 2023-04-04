# docker build -t ff .
# docker run -p 3000:3000 -it ff

FROM node:16-alpine3.15 as dep
WORKDIR /app

#==================================================================

# ==================================================================
FROM node:16-alpine3.15 AS builder
ARG NPM_REGISTRY="https://registry.npmjs.org/"
ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME
ARG BUILD_SHORT_SHA
ENV NEXT_PUBLIC_BUILD_SHORT_SHA=$BUILD_SHORT_SHA

WORKDIR /app
ENV npm_config_registry=$NPM_REGISTRY
RUN npm install --location=global lerna
COPY ./package.json ./package-lock.json lerna.json ./
COPY ./packages/core/package.json ./packages/core/
COPY ./packages/portal/package.json ./packages/portal/
RUN apk add --no-cache --virtual .gyp \
        python3 \
        make \
        g++ \
    && npm ci \
    && apk del .gyp
COPY ./packages ./packages

RUN lerna run --scope @gen3/core compile
RUN lerna run --scope @gen3/core build
RUN lerna run --scope portal build
# ==================================================================

FROM node:16-alpine3.15 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000

RUN  addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nextjs /app/lerna.json ./lerna.json
COPY --from=builder --chown=nextjs:nextjs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nextjs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/public ./packages/portal/public
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/config ./packages/portal/config
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/package.json ./packages/portal/package.json
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/.next ./packages/portal/.next
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/node_modules ./packages/portal/node_modules
COPY --from=builder --chown=nextjs:nextjs /app/packages/portal/next.config.js ./packages/portal/next.config.js

RUN mkdir -p /app/packages/portal/.next \
  && chown nextjs:nextjs /app/packages/portal/.next
RUN mkdir -p /app/packages/portal/.next/cache/images \
  && chown nextjs:nextjs /app/packages/portal/.next/cache/images
VOLUME  /app/packages/portal/.next
USER nextjs

EXPOSE 3000

User root

CMD ["npm", "run", "start"]
