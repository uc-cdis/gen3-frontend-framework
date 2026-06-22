## JEG Workspaces

* Show/Hide panels controls
* Full screen toggle
  ~~* Container Error Panel~~
* Active Kernel? Note sure is this needed
* Correct Runtime
* Persistence of Active Kernels
* Billing Placeholder
* Gateway/Kernel Status
  * ~~reconnection~~
  * dropped connections
  * connection timeout
  * number of connections
  * ~~kernel state~~
  * ~~kernel runtime in minutes~~
* Stop Container Button
  * ~~hide when not running~~
* Select Kernel
* Show upgrade panel in Free Tier
* Hide kernel controls in Free Tier
* Update Polling
  * make polling configurable
* Workspace Status in Navigation
* ProtectedContent Overlay for Non-free Workspaces
  * add authz check
* Prevent Tired access when not logged in/authorized
* Test deployment
    * Kernels
    * Proxys
* Fix service config/definition
* move to NPM
* create public stub for npm package
* Development Environment Support

## Load images

kind load docker-image quay.io/cdis/gen3-vectis:qa-jeg --name kind-multi-node
kind load docker-image quay.io/cdis/gen3-vectis:gen3-vectisv6 --name kind-multi-node
kind load docker-image quay.io/cdis/gen3-vectis:qa-goproxy --name kind-multi-node

## Apply CA patch

```
./setup-kind-gen3.sh --patch-ca hatchery
```

## need to label kind with to enable the hatchery pods to start

```
kubectl label node kind-multi-node-control-plane role=jupyter
```
