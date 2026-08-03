#!/usr/bin/env bash
set -euo pipefail

KIND_NODE="${KIND_NODE:-kind-multi-node-control-plane}"
HOSTNAME="${HOSTNAME:-gen3dev.local.io}"

echo "Getting IP address of host.docker.internal from ${KIND_NODE}..."
HOST_IP=$(docker exec "${KIND_NODE}" getent ahostsv4 host.docker.internal | awk 'NR==1{print $1}')

if [[ -z "${HOST_IP}" ]]; then
  echo "ERROR: Could not resolve host.docker.internal" >&2
  exit 1
fi

echo "Resolved host.docker.internal -> ${HOST_IP}"

echo "Patching CoreDNS configmap..."
COREFILE=$(kubectl -n kube-system get configmap coredns -o jsonpath='{.data.Corefile}')

# Inject hosts block if not already present
if echo "${COREFILE}" | grep -q "hosts {"; then
  echo "WARNING: 'hosts' block already exists in CoreDNS configmap. Skipping patch."
else
  PATCHED=$(echo "${COREFILE}" | sed "/^    prometheus :9153/i\\    hosts {\\n        ${HOST_IP} ${HOSTNAME}\\n        fallthrough\\n    }")
  kubectl -n kube-system patch configmap coredns --type merge \
    -p "{\"data\":{\"Corefile\":$(echo "${PATCHED}" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')}}"
  echo "CoreDNS configmap patched."
fi

echo "Restarting CoreDNS..."
kubectl -n kube-system rollout restart deployment coredns
kubectl -n kube-system rollout status deployment coredns --timeout=60s

echo "Verifying DNS resolution for ${HOSTNAME}..."
kubectl run -it --rm dns-test --image=busybox:1.36 --restart=Never -- nslookup "${HOSTNAME}"

echo "Done."
