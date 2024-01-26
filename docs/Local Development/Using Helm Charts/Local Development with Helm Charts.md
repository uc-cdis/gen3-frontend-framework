## Local Development with Helm and Kubernetes

One way to develop locally is to use [Helm](https://helm.sh/) and [Kubernetes](https://kubernetes.io/).
This is a good way to test your changes in a real environment, and to test your changes with other services.
The steps below will allow you as a Gen3 developer to run Gen3 services to support
Gen3 Frontend Framework development. This is doe by creating a Kubernetes running
Gen3 services using Helm charts and run the Gen3 Frontend Framework using `npm run dev`.

To do this you need to proxy https using the SSL certificate from the Gen3 Helm Charts.

These instructions assume you will be running the frontend on port 3000 and 3010 during development. If
you need to run on a different port, you will need to update any mentions of port 3000 in this
document to your desired port.


### Setting up Gen3 Helm Charts
The first set is setting up the Gen3 Helm Charts.
Follow the instructions in [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm) for setting up the Gen3 Helm Charts.

Follow the instructions in the [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm/blob/master/docs/gen3_developer_environments.md)
and optionally the instructions for  setting up rancher-desktop.

Next copy the `values.yaml`, and optionally `user.yaml` file from the gen3-frontend-framework root to the `gen3-helm` root.
You can also use the gen3 helm chart's `values.yaml`.

Edit the `values.yaml` file and add your google client id and secret. If you are using a port other than
3010 you will need to change the `LOGIN_REDIRECT_WHITELIST: [https://localhost:3010]` to the port you are using for
https.

Start the gen3 helm charts with `helm upgrade --install gen3 ./helm/gen3 -f ./values.yaml -f ./user.yaml`

## Connecting the sample portal to the Gen3 Helm Charts

There are two ways to connect the sample portal to the Gen3 Helm Charts. The first is to create a
self-signed certificate with a root and add it to your browser. Then run nginx to proxy https to the Gen3 Helm Charts.

### Creating a self-signed certificate with a root
You can use minica to create a self-signed certificate with a root. Follow the instructions from minica's
website [minica](https://github.com/jsha/minica). You will need to add the root certificate to your browser.



The second is to use a proxy to proxy https
to the Gen3 Helm Charts

### Setting up https using a proxy

You will need to install a https proxy as described
[add https to your localhost](https://dev.to/defite/adding-https-to-your-localhost-15hg).

#### Get the SSL certificate from the Gen3 Helm Charts

Once the Gen3 Helm Charts are running, you will need to get the SSL certificate from the Gen3 Helm Charts.
To do this from the root of the gen3-fronted-framework source code run the following command:

```
packages/tools/localDev/get_certs_from_gen3_helm.sh
```

This will extract the localhost certificate and key in the directory `certificates` from the helm charts which is
needed by local-ssl-proxy.

Start the proxy using:
```
local-ssl-proxy --source 3010 --target 3000 --cert certificates/localhost/fullchain.pem --key certificates/localhost/privkey.pem
```

### Connecting the sample portal to the Gen3 Helm Charts


1. Run the portal using `npm run dev`
2. [Open Chrome (web browser)](https://alfilatov.com/posts/run-chrome-without-cors/) which disables web security to suppress the CORS warning.
   Or, if using Safari for feature testing with a logged-in user, click Develop -> Disable Cross-Origin Restrictions..

3. After these steps, you can access the commons on `https://localhost:3010`
4. You will likely see a warning about a self-signed certificate. You can ignore this warning and accept the certificate.
5. You can test if fence login is working by clicking on the login button. You should be redirected to the google login page.
