#!/usr/bin/env bash

GEN3_REMOTE_API=$1 envsubst "\$GEN3_REMOTE_API" < revproxy_nginx_with_certs.template > /opt/homebrew/etc/nginx/nginx.conf
nginx -s reload
