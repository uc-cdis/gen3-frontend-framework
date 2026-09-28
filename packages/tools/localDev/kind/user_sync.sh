#!/usr/bin/env bash
# Simple script to run user sync on kine cluster assumes namespace is `default`

kubectl apply -f /tmp/useryaml-manual-job.yaml -n default
