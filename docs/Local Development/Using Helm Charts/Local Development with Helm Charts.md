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

Follow the instructions in
the [Gen3 Helm Charts](https://docs.gen3.org/gen3-resources/operator-guide/helm/helm-deploy-example/)

Follow the instructions in [Gen3 Helm Charts Local Development](https://github.com/uc-cdis/gen3-helm?tab=readme-ov-file#local-development) **steps 1-3** for setting up the Gen3 Helm Charts.

Next copy the `values.yaml`, and optionally `user.yaml` file from the gen3-frontend-framework root to the `gen3-helm` root.
You can also use the gen3 helm chart's `values.yaml`.

Edit the `values.yaml` file and add your google client id and secret. If you are using a port other than
3010 you will need to change the `LOGIN_REDIRECT_WHITELIST: [https://localhost:3010]` to the port you are using for
https.

Start the gen3 helm charts with `helm upgrade --install gen3 ./helm/gen3 -f ./values.yaml -f ./user.yaml`


### Connecting the sample portal to the Gen3 Helm Charts

1. Add the following to `.env.development.local`:

```
   NEXT_PUBLIC_GEN3_COMMONS_NAME=canine
   NEXT_PUBLIC_GEN3_API=http://localhost:3000
   NEXT_PUBLIC_GEN3_API_TARGET=https://localhost
```
3. Run the portal using `npm run dev`
4. After these steps, you can access the commons on `http://localhost:3000`
5. You will likely see a warning about a self-signed certificate. You can ignore this warning and accept the
   certificate.
6. You can test if fence login is working by clicking on the login button. You should be redirected to the google login
   page.

### Remote access using credentials login

If you want to test the portal with credentials login you can use the following steps. In the login.json configuration file, you can add the following configuration:
add the following:
```json
"showCredentialsLogin": true
```
Refer to the [Using Credentials Login](../Credentials%20Login/Using%20Credentials%20Login.md) for more information on how to use credentials login.

Note that credentials login will only work for development more, in production you will need to use fence login.
