#!/bin/bash

GEN3_FRONTEND_CONFIGURATION_ROOT=${GEN3_FRONTEND_CONFIGURATION_ROOT:-"./config"}

set -e
export NODE_ENV=production
echo "npm run start"
npm run start
