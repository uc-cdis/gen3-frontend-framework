# docker build -t ff .
# docker run -p 3000:3000 -it ff

FROM quay.io/cdis/ubuntu:20.04 as build

ARG NODE_VERSION=16


ENV DEBIAN_FRONTEND=noninteractive

ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl1.1 \
    libgnutls30 \
    ca-certificates \
    curl \
    git \
    nginx \
    python3 \
    time \
    && curl -sL https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/src/apt/lists/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && npm install -g npm@8.5

WORKDIR /gen3


RUN  addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs
RUN npm install --location=global lerna@6.6.1
COPY ./package.json ./package-lock.json lerna.json ./
COPY ./packages/core/package.json ./packages/core/
COPY ./packages/tools/package.json ./packages/tools/
COPY ./packages/portal/package.json ./packages/portal/
RUN npm ci
COPY ./packages ./packages

RUN lerna run --scope @gen3/core compile
RUN lerna run --scope @gen3/core build
RUN lerna run --scope portal build

ENV PORT=80
CMD ["npm", "run", "start"]
