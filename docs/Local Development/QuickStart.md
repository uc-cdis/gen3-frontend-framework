# Gen3.2 Frontend Quickstart

This guide will get you up to speed on configuring a Gen3 Frontend Applications. There are other tutorial on running it locally (for example: (Local Development)[]).

See the README for instructions on cloning, installing and running the Gen3 frontend framework.

## Configuration

In the root of the app's source code there are .env files:

```.env.development``` and ```.env.production```.  The format is:
```
GEN3_COMMONS_NAME=gen3
NEXT_PUBLIC_GEN3_API=https://localhost:3010
NEXT_PUBLIC_GEN3_DOMAIN=https://localhost:3010
```

These set what config directory is used (```GEN3_COMMONS_NAME```) and where the endpoints are running. The defaults are ```gen3``` and https://localhost. If you are running in helm charts the only value to set is ```GEN3_COMMONS_NAME```.

The site is configured in the directory ```config/$GEN3_COMMONS_NAME```. There is a .json file for each of the Gen3 pages. For example the Discovery page is configure in ```discovery.json```. Note that currenty the file must exist if the page will be used. You can disable a page by removing the associated file.
