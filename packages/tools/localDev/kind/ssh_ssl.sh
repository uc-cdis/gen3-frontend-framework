#!/bin/bash

echo "Setting up Gen3 SSL certificates..."

# Choose your hostname approach
HOSTNAME="host.docker.internal"  # or "gen3dev.local.io"

# Generate certificates if they don't exist
if [ ! -f "${HOSTNAME}+2.pem" ]; then
    mkcert $HOSTNAME localhost 127.0.0.1
fi

# Create TLS secret
kubectl create secret tls gen3-local-tls \
  --cert=${HOSTNAME}+2.pem \
  --key=${HOSTNAME}+2-key.pem

# Create CA secret
CAROOT=$(mkcert -CAROOT)
kubectl create secret generic mkcert-ca --from-file=ca.crt="$CAROOT/rootCA.pem"

# Patch ingress
kubectl patch ingress gen3-revproxy --type='merge' -p="{
  \"spec\": {
    \"tls\": [{\"hosts\": [\"$HOSTNAME\"], \"secretName\": \"gen3-local-tls\"}],
    \"rules\": [{\"host\": \"$HOSTNAME\", \"http\": {\"paths\": [{\"path\": \"/\", \"pathType\": \"Prefix\", \"backend\": {\"service\": {\"name\": \"revproxy-service\", \"port\": {\"number\": 80}}}}]}}]
  }
}"

# Wait for services to be ready
kubectl wait --for=condition=available deployment/revproxy-deployment --timeout=300s
kubectl wait --for=condition=available deployment/requestor-deployment --timeout=300s

# Apply CA patches
kubectl patch deployment revproxy-deployment --patch-file simple-direct-ca-patch.yaml
kubectl patch deployment requestor-deployment --patch-file requestor-python-ca-patch.yaml

echo "SSL setup complete!"
echo "Access your Gen3 cluster at: https://$HOSTNAME"
