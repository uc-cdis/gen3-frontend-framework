## JEG Workspaces

* ~~Show/Hide panels control~~
  * ~~tooltips for each panel button~~
* ~~Full screen toggle~~
  ~~* Container Error Panel~~
* Match wireframe
  * landing page
    ~~* Terminate Kernels~~
* Active Kernel? Note sure is this needed
* Correct Runtime
* Persistence of Active Kernels
* Billing Placeholder
* Gateway/Kernel Status
  * ~~reconnection~~
  * dropped connections
  * connection timeout
  * ~~number of connections~~
  * ~~kernel state~~
  * ~~kernel runtime in minutes~~
* ~~Stop Container Button~~
  * ~~hide when not running~~
* Select Kernel
* ~~Show upgrade panel in Free Tier~~
* ~~Hide kernel controls in Free Tier~~
* Update Polling
  * make polling configurable
* Workspace Status in Navigation
* Prevent Tier access when not logged in/authorized
* Test deployment
    * Kernels
    * Proxys
* Fix service config/definition
  * Hatchery URL
  * Jupyter lite source
* move to NPM
* ~~create public stub for npm package~~
* Development Environment Support

# Backlog

* ProtectedContent Overlay for Non-free Workspaces
  * add authz check

## Load images

## pull images if needed

```bash
docker pull --platform linux/amd64 quay.io/cdis/gen3-vectis:qa-jegv2
docker pull --platform linux/amd64 quay.io/cdis/gen3-vectis:gen3-vectisv6
docker pull --platform linux/amd64 quay.io/cdis/gen3-vectis:qa-goproxy
docker pull --platform linux/amd64 quay.io/cdis/multihead-workspace-proxy:feat_init
```

kind load docker-image quay.io/cdis/gen3-vectis:qa-jegv2 --name kind-multi-node
kind load docker-image quay.io/cdis/gen3-vectis:gen3-vectisv6 --name kind-multi-node
kind load docker-image quay.io/cdis/gen3-vectis:qa-goproxy --name kind-multi-node
kind load docker-image quay.io/cdis/multihead-workspace-proxy:feat_init --name kind-multi-node

# load local frontend image

```
kind load docker-image gen3:fef --name kind-multi-node
```
## Apply CA patch

```
./setup-kind-gen3.sh --patch-ca hatchery
./setup-kind-gen3.sh --patch-ca revproxy
```

## need to label kind with to enable the hatchery pods to start

```
kubectl label node kind-multi-node-control-plane role=jupyter
```

# set up fence with 'credentials' scope

```bash
fence-create client-create --client gen3dev2 --urls http://localhost:3000/api/auth/callback --username craigrbarnes@uchicago.edu   --allowed-scopes openid user data credentials --grant-types authorization_code refresh_token
```

```bash
fence-create client-create \
  --client gen3dev \
  --urls http://localhost:3000/api/auth/callback https://gen3dev.local.io/api/auth/callback \
  --username craigrbarnes@uchicago.edu \
  --allowed-scopes openid user data credentials google_service_account google_link google_credentials openid admin user data fence ga4gh_passport_v1
```

modify example

```bash
fence-create client-modify --client gen3dev --urls http://gen3dev.local.io:3000/api/auth/callback
fence-create client-modify --client gen3dev --allowed-scopes openid user data credentials fence google_service_account google_link google_credentials admin ga4gh_passport_v1
```

then add to `.env.development.local`:

```bash
FENCE_CLIENT_ID=<<fence client id>>
FENCE_CLIENT_SECRET=<<fence client secret>> # pragma: allowlist secret
FENCE_REDIRECT_URI=http://gen3dev.local.io:3000/api/auth/callback
```

## Need to allow pods to find localhost:

get ip address of host.docker.internal

```bash
docker exec kind-multi-node-control-plane python3 -c "import socket; print(socket.gethostbyname('host.docker.internal'))"
```

edit the coredns configmap, adding the ip address to the hosts section

```bash
 kubectl -n kube-system edit configmap coredns
```

```yaml
.: 53{
    errors
    health
    ready
    kubernetes cluster.local in-addr.arpa ip6.arpa {
        pods insecure
        fallthrough in-addr.arpa ip6.arpa
        ttl 30
    }
    hosts {
        <host.docker.internal> gen3dev.local.io
        fallthrough
    }
    prometheus :9153
    forward . /etc/resolv.conf
    cache 30
    loop
    reload
    loadbalance
}
```

restart coredns to run change

```bash
kubectl -n kube-system rollout restart deployment coredns
```

verify

```bash
kubectl run -it --rm dns-test --image=busybox:1.36 --restart=Never -- nslookup gen3dev.local.io
```

## Build and deploy docker file

```bash
npm run build:docker
kind load docker-image gen3:fef --name kind-multi-node
kubectl rollout restart deployment/frontend-framework-deployment
```
