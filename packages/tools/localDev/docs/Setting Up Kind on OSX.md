# Setting up Kind
To use kind instead of rancher-desktop.

- Install kind: https://kind.sigs.k8s.io/docs/user/quick-start

There are kind config files in ```packages/tools/localDev/kind``` or:

- Add the following config file (```kind-config.yaml```):
```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
name:  kind-multi-node
networking:
  ipFamily: ipv4
  apiServerAddress: 127.0.0.1
nodes:
  - role: control-plane
    kubeadmConfigPatches:
      - |
        kind: InitConfiguration
        nodeRegistration:
          kubeletExtraArgs:
            node-labels: "ingress-ready=true"
    extraPortMappings:
      - containerPort: 80
        hostPort: 80
        protocol: TCP
      - containerPort: 443
        hostPort: 443
        protocol: TCP
```
- Start the cluster:
```bash
  kind create cluster --config kind-config.yaml
```
  Stopping the cluster:
  ```bash
  kind delete cluster --name=kind-multi-node
  ```

## Set up ingress
  Notes from : https://dustinspecker.com/posts/test-ingress-in-kind/
```bash
  kubectl apply --filename https://raw.githubusercontent.com/kubernetes/ingress-nginx/master/deploy/static/provider/kind/deploy.yaml
  kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

## Setting up a self-signed certificate

You will need to create a self-signed certificate for the ingress. You can use mkcert to generate a certificate for
localhost. You can install mkcert by following the instructions here: https://github.com/FiloSottile/mkcert#installation

You can use localhost or gen3dev.local.io for the domain name. 127.0.0.1 is the IP address for localhost. You need to
add gen3dev.local.io to your hosts file `/etc/hosts`, by adding:

```aiignore
127.0.0.1       gen3dev.local.io
```

You have two options for hostname configuration:

### Option 1: Use gen3dev.local.io (Requires DNS Configuration)

```bash
# Generate certificates for gen3dev.local.io and localhost
mkdir ~/ssl_certs
mkcert -cert-file ~/ssl_certs/cert.pem -key-file ~/ssl_certs/key.pem gen3dev.local.io localhost 127.0.0.1

# This creates:
# - gen3dev.local.io+2.pem (certificate)
# - gen3dev.local.io+2-key.pem (private key)
```

### Option 2: Use host.docker.internal (Simpler)

```bash
mkdir ~/ssl_certs
# Generate certificates using host.docker.internal (works out-of-the-box with Kind)
mkcert -cert-file ~/ssl_certs/cert.pem -key-file ~/ssl_certs/key.pem host.docker.internal localhost 127.0.0.1

# This creates:
# - host.docker.internal+2.pem (certificate)
# - host.docker.internal+2-key.pem (private key)
```

### Create Kubernetes TLS Secret

Create a Kubernetes secret with your SSL certificate:

```bash
kubectl create secret tls gen3-local-tls --cert=$HOME/ssl_certs/cert.pem --key=$HOME/ssl_certs/key.pem
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

use ```packages/tools/localDev/kind/ingress-gen3dev_local_io.yaml``` or create a file
```ingress-gen3dev_local_io.yaml```:
```yaml
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
        - localhost
      secretName: gen3-local-tls
  rules:
    - host: "gen3dev.local.io"
      http:
        paths:
          - pathType: Prefix
            path: "/"
            backend:
              service:
                name: revproxy-service
                port:
                  number: 80
```

add to cluster (gen3dev.local.io):
```bash
  kubectl apply -f ingress-gen3dev_local_io.yaml
```

or
add to cluster (localhost):

```bash
  kubectl apply -f ingress-local-dev.yaml
```

## Create mkcert CA Secret

Create a Kubernetes secret with the mkcert CA certificate for container trust:

```bash
# Get the CA certificate location
CAROOT=$(mkcert -CAROOT)
echo "mkcert CA location: $CAROOT"

# Create a secret from the CA certificate
kubectl create secret generic mkcert-ca --from-file=ca.crt="$CAROOT/rootCA.pem"

# Verify the secret was created
kubectl get secret mkcert-ca

Note that mkcert should add your CA to the system-wide trust store. If not you will need to add them to OSX
keychain and trust them.

### Workspace support

If you are running frontend development on https://localhost:3000 you will need to follow
these instructions to update the Content-Security-Policy:
```
 kubectl edit configmap ingress-nginx-controller -n ingress-nginx
```
add to the end of the file:
```
data:
  allow-snippet-annotations: "true"
  annotations-risk-level: Critical
```

write the config and exit: It will reload and allow snippets used
by running
```bash
 :qingress-local-dev.yaml
```
or use in the alternate config below:

```
#
# Version to support development with iframes which add https://localhost:3010
# to the Content-Security-Policy for iframes
# before this is uses you will need to:
#
#   kubectl edit configmap ingress-nginx-controller -n ingress-nginx
#   add:
#     apiVersion: v1
#     data:
#       allow-snippet-annotations: "true"
#       annotations-risk-level: Critical
#
#   write the config and exit: It will reload and allow snippets used below.
#
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ngress-nginx-controller
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/configuration-snippet: |
      more_set_headers "Content-Security-Policy: frame-ancestors self https://localhost https://localhost:3010";
spec:
  tls:
  - hosts:
    - localhost
    secretName: localhost-gen3
  rules:
  - host: "localhost"
    http:
      paths:
        - pathType: Prefix
          path: "/"
          backend:
            service:
              name: revproxy-service
              port:
                number: 80
```

## Gen3 Helm

You can now run gen3 helm charts. You will need to edit your values.yaml and set up the services you want to run.

## Additional Notes
To check the contents of a certificate:
```bash
kubectl get secret gen3-local-tls -n default -o json | jq '."data"."tls.crt"'| sed 's/"//g'| base64 -d | openssl x509  -text -noout
```

To get all ingresses
```bash
kubectl get ingress --all-namespaces
```

Ingress configuration
```bash
 kubectl get ingress revproxy-dev -o yaml
```

delete ingress
```bash
kubectl delete ingress revproxy-dev
```

delete secret
```bash
 kubectl delete secret gen3-local-tls --namespace default
```

If you have certificate issues, confirm the secret is correct by
viewing the ingress config and confirm the secret name is the same in the
configuration
