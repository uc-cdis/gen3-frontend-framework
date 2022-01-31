# docker build -t ff .
# docker run -p 3000:3000 -it ff

FROM quay.io/cdis/ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update

RUN apt-get install -y --no-install-recommends \
    build-essential \
    libssl1.1 \
    libgnutls30 \
    ca-certificates \
    curl \
    git \
    nginx \
    python3 \
    time \
    vim \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log \
    && npm install -g npm@8 \
    && npm config set maxsockets 5

RUN mkdir -p /gen3
COPY . /gen3
WORKDIR /gen3/

RUN npm install
RUN npm run compile
RUN npm run build

ENV BASE_PATH="/ff"

CMD npm run start
