#!/usr/bin/env bash
# Simple script to run user sync on kine cluster assumes namespace is `default`

JOB_NAME="useryaml-manual-$(date +%s)"
sed "s/useryaml-manual-[0-9]*/${JOB_NAME}/" ./useryaml-manual-job.yaml | kubectl apply -f - -n default
