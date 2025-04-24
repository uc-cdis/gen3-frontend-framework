#!/bin/bash

GEN3_FRONTEND_CONFIGURATION_ROOT=${GEN3_FRONTEND_CONFIGURATION_ROOT:-"./config"}

set -e
export NODE_ENV=production
echo "running NextJS server"
HOSTNAME=0.0.0.0
node packages/sampleCommons/server.js
