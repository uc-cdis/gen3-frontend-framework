# Gen3 Frontend Architecture

## Overview

Gen3 data commons are composed of a number of microservices that are deployed
to a Kubernetes cluster.  The microservices are written in a variety of
languages, and are deployed as Docker containers.  The microservices are
exposed to the internet via an API gateway, which is also deployed as a
Docker container.  The API gateway is responsible for routing requests to
the appropriate microservice, and for enforcing authentication and
authorization policies.

The Gen3 frontend is a React application that is served by a Node.js
microservice.  The frontend is deployed as a Docker container, and is
exposed to the internet via the API gateway.  The frontend is responsible
for rendering the user interface, and for making requests to the
microservices to retrieve data.

## Architecture

The Gen3 frontend is a React application that is served by a Node.js
microservice.  The frontend is deployed as a Docker container, and is
exposed to the internet via the API gateway.  The frontend is responsible
for rendering the user interface, and for making requests to the
microservices to retrieve data.

The frontend is composed of several packages that are published to NPM.
The packages are:
   * @gen3/core
   * @gen3/frontend
   * @gen3/toolsff

The @gen3/core package contains the core components that are used by the
frontend.  The @gen3/frontend package contains the React components that
are used to render the user interface.  The @gen3/toolsff package contains
the tools that are used to build and deploy the frontend.

In addition to the packages that are published to NPM, there is a sample data commons that
is provide in the monorepo (```sampleCommons```).  The sample data commons is used to test the frontend and to
simplify development of the frontend.

### @gen3/core

The core package contains the core components that are used to interface various Gen3 services.
These include the metata service, the data dictionary service, the user service, and the indexd service.
The core package also contains the components that are used to interface the fence service, which is used
for authentication and authorization.

The core package is published to NPM, and is used by the @gen3/frontend package, as well as by the
@gen3/toolsff package and the sample data commons.

### @gen3/frontend

The frontend package contains the React components that are used to render the user interface.
It is published to NPM, and is used sample data commons. The frontend package is structured as follows:
* src/components - contains Gen3 (React/mantine) components that are used to render the user interface
* src/pages - contain standard Gen3 pages:
  * Data Dictionary
  * Data Explorer
  * Discovery
  * Profile
  * Workspace
  * Analysis Tools *
  * Workflows *
* src/features: hold composite components that are composed of Gen3 components and used in Gen3 pages.
* src/utils: contains utility functions that are used internally by the frontend.

## Sample Data Commons

The sampleCommons is a NextJS application that is used to test the frontend and to simplify development of the frontend.
It is structured as follows:
* src/pages - contains the pages that are used to render relevant Gen3 pages, these basically import the relevant page from the @gen3/frontend package.
* src/lib - contains both custom code for TableCell renderers, configuraion fuctions, and the code that is used to load plugins.
* config - contains the configuration files that are used to configure the sampleCommons.
