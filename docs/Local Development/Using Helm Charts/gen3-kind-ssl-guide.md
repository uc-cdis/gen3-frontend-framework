# Gen3 Kind Cluster SSL Setup Guide

## Overview

This guide shows how to set up a Gen3 cluster in Kind (Kubernetes in Docker) with proper SSL certificates using mkcert, eliminating the "Kubernetes Ingress Controller Fake Certificate" issue.

## Prerequisites

- Kind cluster running
- mkcert installed
- kubectl configured for your Kind cluster
- Gen3 services deployed
- gen3dev.local.io defined in /etc/hosts as:
  - ```127.0.0.1 gen3dev.local.io```

## Step 1: Create mkcert Certificates

You have two options for hostname configuration:

### Option 1: Use gen3dev.local.io (Requires DNS Configuration)
```bash
# Generate certificates for gen3dev.local.io and localhost
mkdir ~/ssl_certs
mkcert -cert-file ~/ssl_certs/cert.pem -key-file ~/ssl_certs/key.pem gen3dev.local.io localhost 127.0.0.1

# This creates:
# - ~/ssl_certs/cert.pem (certificate)
# - ~/ssl_certs/key.pem (private key)
```


### Option 2: Use host.docker.internal (Simpler)
```bash
mkdir ~/ssl_certs
# Generate certificates using host.docker.internal (works out-of-the-box with Kind)
mkcert -cert-file ~/ssl_certs/cert.pem -key-file ~/ssl_certs/key.pem host.docker.internal localhost 127.0.0.1

# This creates:
# - ~/ssl_certs/cert.pem (certificate)
# - ~/ssl_certs/key.pem (private key)
```

Note: the ~/ssl_cert directory is read by the npm run setProxy command for
proxying to gen3 services for gen3 frontend development.

## Step 2: Create Kubernetes TLS Secret

Create a Kubernetes secret with your SSL certificate:

### If using gen3dev.local.io:
```bash
kubectl create secret tls gen3-local-tls --cert=$HOME/ssl_certs/cert.pem --key=$HOME/ssl_certs/key.pem
```

### If using host.docker.internal:
```bash
kubectl create secret tls gen3-local-tls \
  --cert=$HOME/ssl_certs/cert.pem \
  --key=$HOME/ssl_certs/key.pem
```

```bash
# Verify the secret was created
kubectl get secret gen3-local-tls
```
returns something like:
```aiignore
NAME             TYPE                DATA   AGE
gen3-local-tls   kubernetes.io/tls   2      33s
```

## Step 3: Update Ingress Configuration

Update your Gen3 ingress to use the SSL certificate and correct hostname:

### If using gen3dev.local.io:
```bash
kubectl patch ingress gen3-revproxy --type='merge' -p='
{
  "spec": {
    "tls": [
      {
        "hosts": ["gen3dev.local.io"],
        "secretName": "gen3-local-tls"
      }
    ],
    "rules": [
      {
        "host": "gen3dev.local.io",
        "http": {
          "paths": [
            {
              "path": "/",
              "pathType": "Prefix",
              "backend": {
                "service": {
                  "name": "revproxy-service",
                  "port": {
                    "number": 80
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}'
```

### If using host.docker.internal:
```bash
kubectl patch ingress gen3-revproxy --type='merge' -p='
{
  "spec": {
    "tls": [
      {
        "hosts": ["host.docker.internal"],
        "secretName": "gen3-local-tls"
      }
    ],
    "rules": [
      {
        "host": "host.docker.internal",
        "http": {
          "paths": [
            {
              "path": "/",
              "pathType": "Prefix",
              "backend": {
                "service": {
                  "name": "revproxy-service",
                  "port": {
                    "number": 80
                  }
                }
              }
            }
          ]
        }
      }
    ]
  }
}'
```

## Step 4: Create mkcert CA Secret

Create a Kubernetes secret with the mkcert CA certificate for container trust:

```bash
# Get the CA certificate location
CAROOT=$(mkcert -CAROOT)
echo "mkcert CA location: $CAROOT"

# Create a secret from the CA certificate
kubectl create secret generic mkcert-ca --from-file=ca.crt="$CAROOT/rootCA.pem"

# Verify the secret was created
kubectl get secret mkcert-ca
```

## Step 5: Configure SSL for Non-Python Services (like revproxy)

For services that use curl, nginx, or other non-Python HTTP clients:

```bash
# Create patch file for revproxy
cat > simple-direct-ca-patch.yaml << EOF
spec:
  template:
    spec:
      volumes:
      - name: ca-certs
        secret:
          secretName: mkcert-ca
      containers:
      - name: revproxy
        volumeMounts:
        - name: ca-certs
          mountPath: /etc/ssl/certs/mkcert-ca.crt
          subPath: ca.crt
EOF

# Apply the patch
kubectl patch deployment revproxy-deployment --patch-file simple-direct-ca-patch.yaml

# Wait for rollout
kubectl rollout status deployment/revproxy-deployment
```

## Step 6: Configure SSL for Python Services (like requestor)

Python applications need special handling for SSL certificate verification:

```bash
# Create comprehensive patch for Python services
cat > requestor-ca-bundle-patch.yaml << EOF
spec:
  template:
    spec:
      volumes:
      - name: ca-certs
        secret:
          secretName: mkcert-ca
      - name: ca-bundle
        emptyDir: {}
      initContainers:
      - name: setup-ca-bundle
        image: amazonlinux:2023
        command:
        - sh
        - -c
        - |
          echo "Creating CA bundle with mkcert CA..."
          # Copy system CA bundle if it exists
          if [ -f /etc/ssl/certs/ca-bundle.crt ]; then
            cp /etc/ssl/certs/ca-bundle.crt /ca-bundle/ca-bundle.crt
          else
            # Create empty bundle if no system bundle exists
            touch /ca-bundle/ca-bundle.crt
          fi
          # Append our mkcert CA
          cat /mkcert-ca/ca.crt >> /ca-bundle/ca-bundle.crt
          echo "CA bundle created:"
          ls -la /ca-bundle/
        volumeMounts:
        - name: ca-certs
          mountPath: /mkcert-ca
        - name: ca-bundle
          mountPath: /ca-bundle
      containers:
      - name: requestor
        volumeMounts:
        - name: ca-bundle
          mountPath: /etc/ssl/certs/ca-bundle.crt
          subPath: ca-bundle.crt
        env:
        - name: SSL_CERT_FILE
          value: /etc/ssl/certs/ca-bundle.crt
        - name: REQUESTS_CA_BUNDLE
          value: /etc/ssl/certs/ca-bundle.crt
        - name: CURL_CA_BUNDLE
          value: /etc/ssl/certs/ca-bundle.crt
EOF

# Apply the patch
kubectl patch deployment requestor-deployment --patch-file requestor-ca-bundle-patch.yaml

# Wait for rollout
kubectl rollout status deployment/requestor-deployment
```

## Step 7: Apply to Other Services

Apply the appropriate patch to other services based on their type:

### For Other Python Services:
```bash
# Apply to other Python-based services
kubectl patch deployment audit-deployment --patch-file requestor-ca-bundle-patch.yaml
kubectl patch deployment metadata-deployment --patch-file requestor-ca-bundle-patch.yaml
kubectl patch deployment fence-deployment --patch-file requestor-ca-bundle-patch.yaml
```

### For Other Non-Python Services:
```bash
# Apply to other non-Python services
kubectl patch deployment some-other-deployment --patch-file simple-direct-ca-patch.yaml
```

## Step 8: Verification

### Test SSL Certificate is Working:
```bash
# Test from inside a container (adjust hostname based on your choice)
# For gen3dev.local.io:
kubectl run debug-ssl --image=nicolaka/netshoot -it --rm -- openssl s_client -connect gen3dev.local.io:443 -servername gen3dev.local.io -showcerts

# For host.docker.internal:
kubectl run debug-ssl --image=nicolaka/netshoot -it --rm -- openssl s_client -connect host.docker.internal:443 -servername host.docker.internal -showcerts

# You should see your mkcert certificate in the output
```

### Test HTTPS Connections:
```bash
# Test from revproxy container (adjust hostname based on your choice)
REVPROXY_POD=$(kubectl get pods | grep revproxy | grep Running | awk '{print $1}')

# For gen3dev.local.io:
kubectl exec $REVPROXY_POD -- curl --cacert /etc/ssl/certs/mkcert-ca.crt https://gen3dev.local.io/user/jwt/keys

# For host.docker.internal:
kubectl exec $REVPROXY_POD -- curl --cacert /etc/ssl/certs/mkcert-ca.crt https://host.docker.internal/user/jwt/keys

# Test from requestor container (Python) - adjust hostname
REQUESTOR_POD=$(kubectl get pods | grep requestor | grep Running | awk '{print $1}')
kubectl exec $REQUESTOR_POD -- python3 -c "
import ssl
import urllib.request
try:
    # Adjust URL based on your hostname choice
    response = urllib.request.urlopen('https://gen3dev.local.io/user/jwt/keys')  # or host.docker.internal
    print('SSL verification successful!')
    print('Response code:', response.getcode())
except Exception as e:
    print('SSL verification failed:', e)
"
```

### Check Service Logs:
```bash
# Check that SSL errors are gone from logs
kubectl logs deployment/requestor-deployment --tail=20
kubectl logs deployment/revproxy-deployment --tail=20
```

## Troubleshooting

### Common Issues:

1. **"Unable to get local issuer certificate"**: The CA certificate is not properly mounted or configured
2. **"Certificate verify failed"**: Python services need environment variables set
3. **"Host not found"**: Check that your ingress rules match the hostname you're using

### Debug Commands:

```bash
# Check if secrets exist
kubectl get secrets | grep -E "(tls|ca)"

# Check ingress configuration
kubectl describe ingress gen3-revproxy

# Check container CA certificate mounting
kubectl exec $POD_NAME -- ls -la /etc/ssl/certs/

# Check environment variables in Python containers
kubectl exec $POD_NAME -- env | grep -E "(SSL|CA|CERT)"
```

## Automation Script

All of these steps are automated in `packages/tools/localDev/kind/setup-kind-gen3.sh`:

```bash
# Full setup from scratch (cluster + ingress + SSL)
./setup-kind-gen3.sh --all

# Full setup + patch services with CA trust
./setup-kind-gen3.sh --all --patch-ca revproxy,requestor,fence,hatchery

# Full setup + workspace/iframe CSP support
./setup-kind-gen3.sh --all --setup-csp

# Just regenerate SSL and patch services
./setup-kind-gen3.sh --setup-ssl --patch-ca revproxy,fence

# Use host.docker.internal instead
./setup-kind-gen3.sh --all --hostname host.docker.internal

# See all options
./setup-kind-gen3.sh --help
```

The script handles:

- Kind cluster creation with the correct config for your platform
- Nginx ingress controller installation
- mkcert certificate generation and K8s secret creation
- Ingress configuration for your chosen hostname
- CSP headers for workspace/iframe development
- CA trust patching that **appends** the mkcert CA to the system CA bundle (does not replace it)

## Summary

This setup eliminates the "Kubernetes Ingress Controller Fake Certificate" issue by:

1. **Creating proper SSL certificates** with mkcert for local development
2. **Configuring the ingress** to use your real certificate instead of the default fake one
3. **Adding CA trust** to containers so they can verify SSL connections
4. **Handling Python-specific SSL requirements** with environment variables and CA bundles

After following this guide, your Gen3 cluster will have proper SSL certificates and all internal services will be able to make HTTPS calls without certificate verification errors.
