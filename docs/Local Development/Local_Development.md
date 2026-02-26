# Developing and Running a commons from your macbook/desktop

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

once installed, you should be able to run:
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

## Running the frontend locally to access a remote commons.
The important ENV variables are:

```NEXT_PUBLIC_GEN3_COMMONS_NAME=gen3``` this defines the directory to read the configuration from.
For example, since we have copied the ```gen3``` config directory to ```my-datacommons```, we need to add
that variable in ```.env.development.local``` as ```NEXT_PUBLIC_GEN3_COMMONS_NAME=my-datacommons```.

```NEXT_PUBLIC_GEN3_API=http://localhost:3000``` this defines the commons URL the FEF will
use for all the Gen3 services.

```NEXT_PUBLIC_GEN3_API_TARGET=https://gen3.datacommons.io/``` set this to point the locally running
frontend to a remote commons.

#### Tracking
```
NEXT_PUBLIC_DATADOG_APPLICATION_ID=""
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=""
```

this is needed to be setup in DataDog and the values need to match for tracking

## Credentials Login

If you need to log in while running locally,
see: [Credentials Login](https://github.com/uc-cdis/gen3-frontend-framework/blob/develop/docs/Local%20Development/Credentials%20Login/Using%20Credentials%20Login.md)

## Configuration

There is some basic documentation in
 [Configurations](https://github.com/uc-cdis/gen3-frontend-framework/tree/develop/docs/Configuration)

## Gen3 Commons to test features:

### Discovery Page:
