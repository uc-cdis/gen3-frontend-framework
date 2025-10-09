# Developing and Running a common from your macbook/desktop

There are several cases where it's beneficial to develop or run the Gen3 FEF locally, for example
adding new features or testing configurations. This is possible by running the sampleCommons NextJS app
that is part of the Gen3 FEF mono repository. This allows you to test different configuration files with
different commons without requiring a deployment.

## Installation

start by cloning the repository:
```
git clone git@github.com:uc-cdis/gen3-frontend-framework.git
```

cd into ```gen3-frontend-framework``` and install the packages:
```
npm i
```

once install you should be able to run:
```
npm run dev
```

and go to [http://localhost:3000](http://localhost:3000)

## Defining a configuration.
The various configuration files are located in ```packages/sampleCommons/config```.
Each "commons" has a separate directory. By default there is one at
```packages/sampleCommons/config/gen3```.

To setup a new commons config copy the directory and its contents into a new directory within
the ```config``` directory. For example, to create my-datacommons
```
cp -r gen3 my-datacommons
```

Next you will need to set up the .env file for development. This file contains environment variable that
the FEF using for configuration. There is one already checked in
at ```packages/sampleCommons/.env.development```. The recommended way to change it is to create
a .local version i.e. ```packages/sampleCommons/.env.development.local``` and add or override
and variables that you need to. Any variable defined in ```.env.development``` will be used unless
it is overwritten (defined) in ```.env.development.local```

The important ENV variables are:

```NEXT_PUBLIC_GEN3_COMMONS_NAME=gen3``` this defines the directory to read the configuration from.
For example, since we have copied the ```gen3``` config directory to ```my-datacommons```, we need to add
that variable in ```.env.development.local``` as ```NEXT_PUBLIC_GEN3_COMMONS_NAME=my-datacommons```.

```NEXT_PUBLIC_GEN3_API=http://gen3.datacommons.io``` this defines the commons URL the FEF will
use for all the Gen3 services. This is how you can run a commons locally on your machine using a
running commons.

```NEXT_PUBLIC_GEN3_REDIRECT_URL=http://localhost:3000``` this is needed to correctly login
to the local commons

### CORs errors

When you set you remote commons via ```NEXT_PUBLIC_GEN3_API``` to a URL other than http:://localhost:3000 you will
likely see CORs errors. This can be resolved using a proxy like nginx (setup is descibe below) or using a browser
with CORs disabled. For Firefox there is a CORs plugin: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/).
For chrome you can run with CORs disabled by running (on OSX):
```bash
open /Applications/Google\ Chrome.app --args --user-data-dir=/var/tmp/chrome-dev-disabled-security --disable-web-security --disable-site-isolation-trials
```
use this ONLY to go to http://localhost:3000 or https://localhost:3010 and for nothing else.

## Credentials Login

If need to login locally please see: [Credentials Login](https://github.com/uc-cdis/gen3-frontend-framework/blob/develop/docs/Local%20Development/Credentials%20Login/Using%20Credentials%20Login.md)

## Using HTTPS
If you need to use https instead of http,
you wil need to configure a https proxy. The simplest way is described in
[adding https to your localhost](https://dev.to/defite/adding-https-to-your-localhost-15hg).
A more complex but useful alternative is to install and configure nginx as described in
[Local Development with Helm Charts](https://github.com/uc-cdis/gen3-frontend-framework/blob/develop/docs/Local%20Development/Using%20Helm%20Charts/Local%20Development%20with%20Helm%20Charts.md#connecting-the-sample-portal-to-the-gen3-helm-charts)

## Configuration

There is some basic and not quite current documentation in
 [Configurations](https://github.com/uc-cdis/gen3-frontend-framework/tree/develop/docs/Configuration)
