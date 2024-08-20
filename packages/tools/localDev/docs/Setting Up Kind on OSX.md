# Setting up Kind
To use kind instead of rancher-desktop.

- Install kind
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
Create a Kubernetes secret:
```bash
kubectl create secret tls localhost-gen3 --cert=cert.pem --key=key.pem --namespace default
```

confirm secret:
```
kubectl get secrets --namespace default
```
Create a file ```ingress.yaml```:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ngress-nginx-controller
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
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
add to cluster:
```bash
  kubectl apply -f ingress.yaml
```

### Workspace support

If you are running frontend development on https://localhost:3010 you will need to follow
these instructions to update the Content-Security-Policy:
```
 kubectl edit configmap ingress-nginx-controller -n ingress-nginx
```
add:
```
apiVersion: v1
    data:
      allow-snippet-annotations: "true"
```

write the config and exit: It will reload and allow snippets used in the alternate config below:

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
start gen3-helm


## Additional Notes
To check the contents of a certificate:
```bash
kubectl get secret localhost-gen3 -n default -o json | jq '."data"."tls.crt"'| sed 's/"//g'| base64 -d | openssl x509  -text -noout
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
