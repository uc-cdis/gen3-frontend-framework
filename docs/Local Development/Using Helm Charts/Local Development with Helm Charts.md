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

Follow the instructions in the [Gen3 Helm Charts](https://github.com/uc-cdis/gen3-helm/blob/master/docs/gen3_developer_environments.md) **stop at Installing Gen3**.


Follow the instructions in [Gen3 Helm Charts Local Development](https://github.com/uc-cdis/gen3-helm?tab=readme-ov-file#local-development) **steps 1-3** for setting up the Gen3 Helm Charts.

Next copy the `values.yaml`, and optionally `user.yaml` file from the gen3-frontend-framework root to the `gen3-helm` root.
You can also use the gen3 helm chart's `values.yaml`.

Edit the `values.yaml` file and add your google client id and secret. If you are using a port other than
3010 you will need to change the `LOGIN_REDIRECT_WHITELIST: [https://localhost:3010]` to the port you are using for
https.

Start the gen3 helm charts with `helm upgrade --install gen3 ./helm/gen3 -f ./values.yaml -f ./user.yaml`

## Connecting the sample portal to the Gen3 Helm Charts

There are two ways to connect the sample portal to the Gen3 Helm Charts. Both involve creating a
self-signed certificate with a root and add it to your browser.
Once that is done you can run a proxy using nginx (preferred) or use a https-proxy.

### Creating a self-signed certificate with a root
You can use minica to create a self-signed certificate with a root. Follow the instructions from minica's
website [minica](https://github.com/jsha/minica). You will need to add the root certificate to your browser.

You can alternatively use other methods to create a self-signed certificate with a root like `mkcert`.

#### Adding the root certificate to your browser

#### Adding SSL certificates to helm charts

You can also use these ssl certificates in helm charts by converting the cert and key to a base64 string:
```
cat cert.pem | base64
cat key.pem | base64
```

Then add the following to your values.yaml file:
```
ssl:
  cert: <base64 encoded cert>
  key: <base64 encoded key>

```

By doing this the helm chart will use the ssl certificate you created with minica (or other method) and you need
encounter the browser warning about a self-signed certificate. If you receive a warning about a missing root certificate
you will need to add the root certificate to your browser.

### Setting up https using nginx

nginx is a web server that can be used to proxy https. You will need to install nginx and configure it to proxy https.

#### Installing NGINX

Installing NGINX on different operating systems varies slightly due to the differences in the operating systems themselves. Here's a general guide for Windows, macOS, and Linux:

##### Windows

1. **Download**:
   - Visit the official NGINX website and download the Windows version of NGINX.

2. **Installation**:
   - Unzip the downloaded file to a directory of your choice, such as `C:\nginx`.

3. **Running NGINX**:
   - Open the Command Prompt.
   - Navigate to the directory where NGINX was installed, for example, `cd C:\nginx`.
   - Start NGINX by running `start nginx`.

4. **Verifying Installation**:
   - Open your web browser and go to `http://localhost`. You should see the NGINX welcome page.

5. **Stopping/Restarting NGINX**:
   - To stop NGINX, run `nginx -s stop` in the Command Prompt.
   - To restart, run `nginx -s reload`.

##### macOS

1. **Installation using Homebrew** (recommended):
   - If Homebrew is not installed, install it first from `https://brew.sh`.
   - Open Terminal.
   - Install NGINX by running `brew install nginx`.

2. **Starting NGINX**:
   - Run `sudo nginx` to start NGINX.

3. **Verifying Installation**:
   - Visit `http://localhost:8080` in your web browser to see the NGINX welcome page.

4. **Stopping/Restarting NGINX**:
   - To stop NGINX, run `sudo nginx -s stop`.
   - To restart, run `sudo nginx -s reload`.

##### Linux (Debian/Ubuntu-based)

1. **Installation**:
   - Open Terminal.
   - Update your package lists: `sudo apt update`.
   - Install NGINX: `sudo apt install nginx`.

2. **Starting NGINX**:
   - NGINX will start automatically after installation.
   - You can also start it manually: `sudo systemctl start nginx`.

3. **Verifying Installation**:
   - Open a web browser and go to `http://localhost` or your server's IP address.

4. **Stopping/Restarting NGINX**:
   - To stop NGINX: `sudo systemctl stop nginx`.
   - To restart NGINX: `sudo systemctl restart nginx`.

5. **Enabling NGINX to Start at Boot**:
   - Run `sudo systemctl enable nginx`.

##### Notes
- These instructions are general guides. Depending on the specific version of the OS and NGINX, there might be slight differences.
- Always ensure you are using the latest stable version of NGINX for security and performance improvements.
- For detailed configurations and setups, refer to the official NGINX documentation or your specific OS's documentation.

#### Configuring NGINX

Once you have nginx installed you will need to configure it to proxy https. You can do this by using the configuration
file in [docs/Local Development/Using Helm Charts/configs/nginx/revproxy_nginx.conf](configs/nginx/revproxy_nginx.conf). You will need to update the `ssl_certificate` and `ssl_certificate_key`
to point to the certificate and key you created with minica (or other method).

Once you have nginx configured you can start it using `nginx -c <path to nginx.conf>`.
You can stop it using `nginx -c <path to nginx.conf> -s stop`.
You can restart it using `nginx -c <path to nginx.conf> -s reload` and test the configuration using `nginx -c <path to nginx.conf> -t`.

Note that `<path to nginx.conf>` is a absolute path to the nginx.conf file.
Alternatively, you can copy the nginx.conf file to the nginx directory and start nginx using `nginx -c nginx.conf`.

Once nginx is running you can test it by going to `https://localhost:3010` in your browser. You should see the Gen3
portal running. All request to the services running in the
Gen3 Helm Charts will be proxied through nginx.

### Setting up https using a https-proxy

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
local-ssl-proxy --source 3010 --target 3000 --cert cert.pem --key key.pem
```

### Connecting the sample portal to the Gen3 Helm Charts


1. Run the portal using `npm run dev`
2. [Open Chrome (web browser)](https://alfilatov.com/posts/run-chrome-without-cors/) which disables web security to suppress the CORS warning.
   Or, if using Safari for feature testing with a logged-in user, click Develop -> Disable Cross-Origin Restrictions..

3. After these steps, you can access the commons on `https://localhost:3010`
4. You will likely see a warning about a self-signed certificate. You can ignore this warning and accept the certificate.
5. You can test if fence login is working by clicking on the login button. You should be redirected to the google login page.
