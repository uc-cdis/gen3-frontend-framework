## Local Development with Helm and Kubernetes

One way to develop locally is to use [Helm](https://helm.sh/) and [Kubernetes](https://kubernetes.io/).
This is a good way to test your changes in a real environment, and to test your changes with other services.
The steps below will allow you as a Gen3 developer to run Gen3 services to support
Gen3 Frontend Framework development. This is doe by creating a Kubernetes running
Gen3 services using Helm charts and altering the frontend-framework pod deployment so
that edit to the Gen3 frontend framework source code are immediately visible.

### Setting up Gen3 Helm Charts
The first set is seting up the Gen3 Helm Charts.
Follow the instructions in [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm) for setting up the Gen3 Helm Charts.

Currently, the frontend-framwork chart is not in the master branch, so you need to use the `feat/gen3ff` branch.
The means you need to clone the repo and checkout the branch:
```
git clone https://github.com/uc-cdis/gen3-helm.git
cd gen3-helm
git checkout feat/gen3ff
```
From this point follow the instructions in the [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm/blob/master/docs/gen3_developer_environments.md)
include setting up rancher-desktop.

Next copy the `values.yaml`, `user.yaml`, and `devspace.yaml` file from the gen3-frontend-framework root to the `gen3-helm` root.

Edit the `values.yaml` file and add your google client id and secret.

Next update the dependencies:
```
helm dependency build helm/gen3
helm dependency update helm/gen3
```
Do **not** follow the instructions in the [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm/blob/master/docs/gen3_developer_environments.md)
to start the services, as they will be run in the next step.

### Install devspace
[devspace](https://devspace.sh/cli/docs/getting-started/installation) is a tool that will run the services in a kubernetes cluster.
It will also sync your local changes to the running services. Follow the instructions to install devspace.

### Running Helm Chart in Development Mode

Once you have devspace installed you can start the cluster in development
mode. The recommended structure is:
```
some directory-|
               |- gen3-frontend-framework`
               |- gen3-helm
```
Steps:

* The current directory must be `gen3-helm`
* Copy the `values.yaml`, `user.yaml`, and `devspace.yaml` files from `gen3-frontend-framework/docs/Local Development/Using Helm Charts/configs`
* Edit `values.yaml` and add your google `client_id` and `client_secret`
* if the two directories do NOT match as above, either:
  * edit `devspace.yaml` (the one copied into `gen3-helm`) at the top change:
  ```
  vars:
    GEN3FF_SRC_ROOT:
    source: env
    default: ../gen3-frontend-framework
    ```
  * or `export GEN3FF_SRC_ROOT=<root directory of gen3-frontend-framework>`

At this point you should be good to start the services. To do that run:
```
devspace dev
```

You will see something like:
```
info Using namespace 'gen3ff'
info Using kube context 'rancher-desktop'
deploy:dev Deploying chart gen3-chart (dev) with helm...
deploy:dev Deployed helm chart (Release revision: 1)
deploy:dev Successfully deployed dev with helm
dev:revproxy Waiting for pod to become ready...
dev:frontend-framework Waiting for pod to become ready...
dev:revproxy DevSpace is waiting, because Pod revproxy-deployment-devspace-768b66b48f-55fpq has status: Pending
dev:frontend-framework DevSpace is waiting, because Pod frontend-framework-deployment-devspace-7856d7f6c8-plnxl has status: Pending
dev:frontend-framework Selected pod frontend-framework-deployment-devspace-7856d7f6c8-plnxl
dev:frontend-framework sync  Inject devspacehelper...
dev:frontend-framework sync  Start syncing
dev:frontend-framework sync  Sync started on: /Users/craigbarnes/Projects/CTDS/gen3/gen3-frontend-framework <-> /gen3
dev:frontend-framework sync  Waiting for initial sync to complete
dev:frontend-framework sync  Downstream - Initial sync completed
```

This will start the services in the cluster and sync your local changes to the running services.
if all goes well you should be able to go to http://localhost/landing. It might take a
while the first time as the frontend-framework is compiling.

#### Test Edits
You can test if edit to the Gen3 frontend-framework.  Go to `packages/portal/config/gen3/landingPage.json` change anything
for example change `"text": "Gen3 Data Platform"` to `"text": "My Gen3 Data Platform"`,
and reload http://localhost/landing your changes should be visible


You can stop the pods with:
```
devspace purge
```
This will stop the pods and delete the pods.

### Performance
As the pod running Gen3 frontend-framework is continually rebuilding the
site when code changed you might want to allocate more CPU and Memory to that
pod. To do this edit `devspace.yaml` and increase the values in:
```
requests:
  cpu: 0.9
  memory: 512Mi
```
to higher values, Note it's possible that you might not have enough CPU or Memory for all the service pods.
More details on performance tuning will be added.
