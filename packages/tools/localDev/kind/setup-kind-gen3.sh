#!/usr/bin/env bash
#
# setup-kind-gen3.sh - Set up a Kind cluster for Gen3 local development with SSL
#
# This script automates the setup described in the Gen3 Kind SSL guide:
#   1. Create a Kind cluster with proper networking
#   2. Install the nginx ingress controller
#   3. Generate mkcert SSL certificates and create K8s secrets
#   4. Apply ingress configuration
#   5. Configure CSP headers for workspace/iframe development
#   6. Patch services with mkcert CA trust (appends CA, does not replace)
#
# Usage:
#   ./setup-kind-gen3.sh --all
#   ./setup-kind-gen3.sh --all --patch-ca revproxy,requestor,fence,hatchery
#   ./setup-kind-gen3.sh --setup-ssl --patch-ca fence,requestor
#   ./setup-kind-gen3.sh --patch-ca revproxy --hostname host.docker.internal
#
set -euo pipefail

# ── Configuration ────────────────────────────────────────────────────────────

HOSTNAME="${GEN3_HOSTNAME:-gen3dev.local.io}"
CLUSTER_NAME="kind-multi-node"
SSL_CERT_DIR="$HOME/ssl_certs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Step flags ───────────────────────────────────────────────────────────────

DO_CREATE_CLUSTER=false
DO_INSTALL_INGRESS=false
DO_SETUP_SSL=false
DO_SETUP_CSP=false
DO_ALL=false
CA_SERVICES=""

# ── Colors ───────────────────────────────────────────────────────────────────

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
section() { echo -e "\n${BLUE}══════════════════════════════════════════════════${NC}"; echo -e "${BLUE} $*${NC}"; echo -e "${BLUE}══════════════════════════════════════════════════${NC}"; }

# ── Usage ────────────────────────────────────────────────────────────────────

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Set up a Kind cluster for Gen3 local development with proper SSL certificates.

Steps (run individually or use --all):
  --create-cluster      Create the Kind cluster
  --install-ingress     Install nginx ingress controller
  --setup-ssl           Generate mkcert certs, create K8s secrets, apply ingress
  --setup-csp           Configure Content-Security-Policy for workspace/iframe dev
  --all                 Run create-cluster + install-ingress + setup-ssl

Service CA patching:
  --patch-ca SERVICES   Apply mkcert CA trust to services (comma-separated)
                        The CA is APPENDED to the existing CA bundle, not replaced.
                        Known service types:
                          nginx:  revproxy
                          go:     hatchery
                          python: requestor, fence, audit, metadata, indexd, etc.

Configuration:
  --hostname NAME       Hostname to use (default: gen3dev.local.io)
                        Alternative: host.docker.internal
  --cluster-name NAME   Kind cluster name (default: kind-multi-node)
  --cert-dir DIR        SSL certificate directory (default: ~/ssl_certs)
  -h, --help            Show this help message

Examples:
  # Full setup from scratch
  $(basename "$0") --all

  # Full setup + patch services with CA trust
  $(basename "$0") --all --patch-ca revproxy,requestor,fence,hatchery

  # Just regenerate SSL certs and reapply
  $(basename "$0") --setup-ssl

  # Patch specific services with CA trust
  $(basename "$0") --patch-ca fence,requestor

  # Use host.docker.internal instead of gen3dev.local.io
  $(basename "$0") --all --hostname host.docker.internal

  # Full setup with CSP for workspace iframe development
  $(basename "$0") --all --setup-csp
EOF
}

# ── Argument parsing ─────────────────────────────────────────────────────────

if [[ $# -eq 0 ]]; then
  usage
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)             DO_ALL=true; shift ;;
    --create-cluster)  DO_CREATE_CLUSTER=true; shift ;;
    --install-ingress) DO_INSTALL_INGRESS=true; shift ;;
    --setup-ssl)       DO_SETUP_SSL=true; shift ;;
    --setup-csp)       DO_SETUP_CSP=true; shift ;;
    --patch-ca)        CA_SERVICES="$2"; shift 2 ;;
    --hostname)        HOSTNAME="$2"; shift 2 ;;
    --cluster-name)    CLUSTER_NAME="$2"; shift 2 ;;
    --cert-dir)        SSL_CERT_DIR="$2"; shift 2 ;;
    -h|--help)         usage; exit 0 ;;
    *)                 error "Unknown option: $1"; echo; usage; exit 1 ;;
  esac
done

if $DO_ALL; then
  DO_CREATE_CLUSTER=true
  DO_INSTALL_INGRESS=true
  DO_SETUP_SSL=true
fi

# ── Prerequisites ────────────────────────────────────────────────────────────

check_prerequisites() {
  local missing=()
  command -v kind    >/dev/null 2>&1 || missing+=(kind)
  command -v kubectl >/dev/null 2>&1 || missing+=(kubectl)
  command -v docker  >/dev/null 2>&1 || missing+=(docker)

  if $DO_SETUP_SSL || [[ -n "$CA_SERVICES" ]]; then
    command -v mkcert >/dev/null 2>&1 || missing+=(mkcert)
  fi

  if [[ ${#missing[@]} -gt 0 ]]; then
    error "Missing required tools: ${missing[*]}"
    error "Install them before running this script."
    exit 1
  fi

  # Check Docker is running
  if ! docker info >/dev/null 2>&1; then
    error "Docker is not running. Start Docker Desktop first."
    exit 1
  fi
}

# ── Step 1: Create Kind Cluster ──────────────────────────────────────────────

create_cluster() {
  section "Step 1: Creating Kind Cluster"

  # Check if cluster already exists
  if kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"; then
    warn "Cluster '$CLUSTER_NAME' already exists."
    warn "To recreate, run: kind delete cluster --name=$CLUSTER_NAME"
    warn "Skipping cluster creation."
    return 0
  fi

  # Determine config file based on platform
  local config_file="$SCRIPT_DIR/kind-config.yaml"
  if [[ "$(uname -m)" == "x86_64" ]] && [[ "$(uname -s)" == "Linux" ]]; then
    config_file="$SCRIPT_DIR/kind-config-platform-linux-amd.yaml"
    info "Detected Linux AMD64, using platform-specific config"
  fi

  info "Using config: $config_file"
  info "Cluster name: $CLUSTER_NAME"

  kind create cluster --config "$config_file"

  info "Cluster created successfully"
  kubectl cluster-info --context "kind-${CLUSTER_NAME}"
}

# ── Step 2: Install Ingress Controller ───────────────────────────────────────

install_ingress() {
  section "Step 2: Installing Nginx Ingress Controller"

  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml
  info "Waiting for ingress controller pod to be created..."
  local deadline=$((SECONDS + 120))
  until kubectl get pods --namespace ingress-nginx \
      --selector=app.kubernetes.io/component=controller \
      --no-headers 2>/dev/null | grep -q .; do
    if [[ $SECONDS -ge $deadline ]]; then
      error "Timed out waiting for ingress controller pod to appear"
      return 1
    fi
    sleep 3
  done
  info "Pod found, waiting for ready condition (timeout: 120s)..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s

  info "Ingress controller installed and ready"
}

# ── Step 3: Setup SSL ────────────────────────────────────────────────────────

setup_ssl() {
  section "Step 3: Setting Up SSL Certificates"

  info "Hostname: $HOSTNAME"
  info "Certificate directory: $SSL_CERT_DIR"

  # Remind about /etc/hosts for gen3dev.local.io
  if [[ "$HOSTNAME" == "gen3dev.local.io" ]]; then
    if ! grep -q "gen3dev.local.io" /etc/hosts 2>/dev/null; then
      warn "/etc/hosts does not contain gen3dev.local.io"
      warn "Add this line to /etc/hosts:"
      warn "  127.0.0.1  gen3dev.local.io"
      echo
      read -rp "Continue anyway? [y/N] " yn
      if [[ "$yn" != [yY] ]]; then
        error "Aborting. Add the hosts entry and retry."
        exit 1
      fi
    else
      info "/etc/hosts already contains gen3dev.local.io"
    fi
  fi

  # ── Generate mkcert certificates ──

  mkdir -p "$SSL_CERT_DIR"

  if [[ -f "$SSL_CERT_DIR/cert.pem" ]] && [[ -f "$SSL_CERT_DIR/key.pem" ]]; then
    warn "Certificates already exist in $SSL_CERT_DIR"
    warn "Delete them manually to regenerate, or they will be reused."
  else
    info "Generating mkcert certificates..."
    mkcert -install 2>/dev/null || true
    mkcert -cert-file "$SSL_CERT_DIR/cert.pem" \
           -key-file "$SSL_CERT_DIR/key.pem" \
           "$HOSTNAME" localhost 127.0.0.1
    info "Certificates created in $SSL_CERT_DIR"
  fi

  # ── Create TLS secret ──

  if kubectl get secret gen3-local-tls >/dev/null 2>&1; then
    warn "Secret gen3-local-tls already exists, replacing..."
    kubectl delete secret gen3-local-tls
  fi

  kubectl create secret tls gen3-local-tls \
    --cert="$SSL_CERT_DIR/cert.pem" \
    --key="$SSL_CERT_DIR/key.pem"

  info "TLS secret gen3-local-tls created"

  # ── Create CA secret ──

  local caroot
  caroot="$(mkcert -CAROOT)"
  info "mkcert CA location: $caroot"

  if kubectl get secret mkcert-ca >/dev/null 2>&1; then
    warn "Secret mkcert-ca already exists, replacing..."
    kubectl delete secret mkcert-ca
  fi

  kubectl create secret generic mkcert-ca \
    --from-file=ca.crt="$caroot/rootCA.pem"

  info "CA secret mkcert-ca created"

  # ── Apply ingress ──

  info "Applying ingress configuration for $HOSTNAME..."

  cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-nginx-controller
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - "${HOSTNAME}"
    secretName: gen3-local-tls
  rules:
  - host: "${HOSTNAME}"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: revproxy-service
            port:
              number: 80
EOF

  info "Ingress applied"
  echo
  info "Verify secrets:"
  kubectl get secrets | grep -E "(tls|ca)" || true
}

# ── Step 4: Setup CSP for Workspace/Iframe Dev ───────────────────────────────

setup_csp() {
  section "Step 4: Configuring CSP for Workspace/Iframe Development"

  info "Enabling snippet annotations in nginx ingress controller..."

  # Enable snippet annotations
  kubectl patch configmap ingress-nginx-controller -n ingress-nginx \
    --type merge \
    -p '{"data":{"allow-snippet-annotations":"true","annotations-risk-level":"Critical"}}'

  # Restart the ingress controller to pick up the configmap change
  info "Restarting ingress controller to apply configmap changes..."
  kubectl rollout restart deployment ingress-nginx-controller -n ingress-nginx
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=120s

  # Apply ingress with CSP headers
  info "Applying ingress with Content-Security-Policy headers..."

  cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-nginx-controller
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "Content-Security-Policy: frame-ancestors 'self' https://localhost https://localhost:3010";
spec:
  tls:
  - hosts:
    - "${HOSTNAME}"
    secretName: gen3-local-tls
  rules:
  - host: "${HOSTNAME}"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: revproxy-service
            port:
              number: 80
EOF

  info "CSP configuration applied"
  info "Workspace iframes from https://localhost:3010 are now allowed"
}

# ── Step 5: Patch Services with CA Trust ─────────────────────────────────────

# Determine service type for CA patching strategy
get_service_type() {
  case "$1" in
    revproxy)  echo "nginx" ;;
    hatchery)  echo "go" ;;
    *)         echo "python" ;;
  esac
}

# Generate and apply a CA patch for a single service.
# Uses an initContainer to APPEND the mkcert CA to the existing system CA bundle,
# preserving trust for external CAs (unlike the simple mount-and-replace approach).
patch_service_ca() {
  local service="$1"
  local deployment="${service}-deployment"
  local service_type
  service_type="$(get_service_type "$service")"

  info "Patching $deployment (type: $service_type)..."

  # Check if deployment exists
  if ! kubectl get deployment "$deployment" >/dev/null 2>&1; then
    warn "Deployment '$deployment' not found. Skipping."
    return 0
  fi

  local patch_file
  patch_file="$(mktemp "/tmp/ca-patch-${service}-XXXXXX.yaml")"

  case "$service_type" in
    nginx)
      # Nginx: simple mount of the CA cert file. Nginx doesn't use the system
      # CA bundle for upstream verification by default; it uses explicit
      # proxy_ssl_trusted_certificate directives or the mounted cert.
      cat > "$patch_file" <<YAML
spec:
  template:
    spec:
      volumes:
      - name: mkcert-ca
        secret:
          secretName: mkcert-ca
      containers:
      - name: ${service}
        volumeMounts:
        - name: mkcert-ca
          mountPath: /etc/ssl/certs/mkcert-ca.crt
          subPath: ca.crt
YAML
      ;;

    go)
      # Go: uses an initContainer to copy the system CA bundle and append
      # the mkcert CA. Go's crypto/x509 reads from SSL_CERT_FILE or standard
      # OS locations. We mount the combined bundle at a standard path.
      cat > "$patch_file" <<YAML
spec:
  template:
    spec:
      volumes:
      - name: mkcert-ca
        secret:
          secretName: mkcert-ca
      - name: ca-bundle
        emptyDir: {}
      initContainers:
      - name: setup-ca-bundle
        image: alpine:3
        command: [sh, -c]
        args:
        - |
          # Copy existing system CA bundle, then append mkcert CA
          for f in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/cert.pem; do
            if [ -f "\$f" ]; then cp "\$f" /ca-bundle/ca-certificates.crt; break; fi
          done
          [ -f /ca-bundle/ca-certificates.crt ] || touch /ca-bundle/ca-certificates.crt
          cat /mkcert-ca/ca.crt >> /ca-bundle/ca-certificates.crt
          echo "CA bundle created with mkcert CA appended"
        volumeMounts:
        - name: mkcert-ca
          mountPath: /mkcert-ca
        - name: ca-bundle
          mountPath: /ca-bundle
      containers:
      - name: ${service}
        volumeMounts:
        - name: ca-bundle
          mountPath: /etc/ssl/certs/ca-certificates.crt
          subPath: ca-certificates.crt
        env:
        - name: SSL_CERT_FILE
          value: /etc/ssl/certs/ca-certificates.crt
YAML
      ;;

    python)
      # Python: uses an initContainer to build a combined CA bundle.
      # Sets SSL_CERT_FILE, REQUESTS_CA_BUNDLE, and CURL_CA_BUNDLE so that
      # Python's ssl module, the requests library, and curl all use it.
      cat > "$patch_file" <<YAML
spec:
  template:
    spec:
      volumes:
      - name: mkcert-ca
        secret:
          secretName: mkcert-ca
      - name: ca-bundle
        emptyDir: {}
      initContainers:
      - name: setup-ca-bundle
        image: alpine:3
        command: [sh, -c]
        args:
        - |
          # Copy existing system CA bundle, then append mkcert CA
          for f in /etc/ssl/certs/ca-certificates.crt /etc/pki/tls/certs/ca-bundle.crt /etc/ssl/cert.pem /etc/ssl/certs/ca-bundle.crt; do
            if [ -f "\$f" ]; then cp "\$f" /ca-bundle/ca-certificates.crt; break; fi
          done
          [ -f /ca-bundle/ca-certificates.crt ] || touch /ca-bundle/ca-certificates.crt
          cat /mkcert-ca/ca.crt >> /ca-bundle/ca-certificates.crt
          echo "CA bundle created with mkcert CA appended"
        volumeMounts:
        - name: mkcert-ca
          mountPath: /mkcert-ca
        - name: ca-bundle
          mountPath: /ca-bundle
      containers:
      - name: ${service}
        volumeMounts:
        - name: ca-bundle
          mountPath: /etc/ssl/certs/ca-certificates.crt
          subPath: ca-certificates.crt
        env:
        - name: SSL_CERT_FILE
          value: /etc/ssl/certs/ca-certificates.crt
        - name: REQUESTS_CA_BUNDLE
          value: /etc/ssl/certs/ca-certificates.crt
        - name: CURL_CA_BUNDLE
          value: /etc/ssl/certs/ca-certificates.crt
YAML
      ;;
  esac

  kubectl patch deployment "$deployment" --patch-file "$patch_file"
  rm -f "$patch_file"

  info "Waiting for $deployment rollout..."
  if ! kubectl rollout status "deployment/$deployment" --timeout=120s; then
    warn "$deployment rollout did not complete within 120s. Check with: kubectl describe deployment $deployment"
  else
    info "$deployment patched successfully"
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────────

check_prerequisites

if $DO_CREATE_CLUSTER; then
  create_cluster
fi

if $DO_INSTALL_INGRESS; then
  install_ingress
fi

if $DO_SETUP_SSL; then
  setup_ssl
fi

if $DO_SETUP_CSP; then
  setup_csp
fi

if [[ -n "$CA_SERVICES" ]]; then
  section "Step 5: Patching Services with CA Trust"
  IFS=',' read -ra services <<< "$CA_SERVICES"
  for svc in "${services[@]}"; do
    svc="$(echo "$svc" | xargs)"  # trim whitespace
    patch_service_ca "$svc"
  done
fi

echo
info "Done! Access your Gen3 cluster at: https://$HOSTNAME"
