#!/usr/bin/env bash

GEN3_REMOTE_API=prometheus.data-commons.org envsubst "\$GEN3_REMOTE_API" < revproxy_nginx_with_certs.template > /opt/homebrew/etc/nginx/nginx.conf
