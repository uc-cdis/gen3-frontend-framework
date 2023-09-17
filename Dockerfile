# docker build -t gen3ff .
# docker run -p 3000:3000 -it gen3ff
# for Macbook silicon M1/m2 uncomment the following lines and comment quay.io/cdis/ubuntu:20.04:
#FROM arm64v8/ubuntu:20.04 as build

FROM quay.io/cdis/ubuntu:20.04 as build

ARG NODE_VERSION=16

ENV DEBIAN_FRONTEND=noninteractive

ARG BASE_PATH
ARG NEXT_PUBLIC_PORTAL_BASENAME
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

WORKDIR /gen3

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl1.1 \
    libgnutls30 \
    ca-certificates \
    curl \
    git \
    gnupg \
    nginx \
    python3 \
    time \
    vim \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_VERSION.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/src/apt/lists/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && npm install -g npm@8.19.4

RUN  addgroup --system --gid 1001 nextjs && adduser --system --uid 1001 nextjs
RUN npm install --location=global lerna@6.6.1
COPY ./package.json ./package-lock.json lerna.json ./
COPY ./packages/core/package.json ./packages/core/
COPY ./packages/crosswalk/package.json ./packages/crosswalk/
COPY ./packages/tools/package.json ./packages/tools/
COPY ./packages/frontend/package.json ./packages/frontend/
COPY ./packages/sampleCommons/package.json ./packages/sampleCommons/
RUN npm ci
COPY ./packages ./packages
RUN npm install \
    "@swc/core" \
    "@napi-rs/magic-string"
RUN lerna run --scope @gen3/core build:clean
RUN lerna run --scope @gen3/crosswalk build:clean
RUN lerna run --scope @gen3/frontend build
RUN lerna run --scope @gen3/datacommonsapp build
ENV PORT=80
CMD ["npm", "run", "start"]
