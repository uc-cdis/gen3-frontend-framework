#!/bin/bash

set -e
export NODE_ENV=production
echo "npm run build"
npm run build
echo "npm run start"
npm run start
