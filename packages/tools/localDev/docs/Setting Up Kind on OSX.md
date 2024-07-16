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
```

confirm secret:
```
kubectl get secrets --namespace ingress-nginx
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
start gen3-helm
