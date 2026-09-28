# Changing the Base Path

Since the Gen3 frontend framework is built with NextJS, the base path can be changed by defining the BASE_PATH
environment variable. Once defined, the base path will be used by the frontend framework to generate URLs and paths.

For example, if you set the BASE_PATH environment variable to `/ff`, all URLs and paths used with the frontend framework
will include `/ff` as the base path. This means you do NOT have to update paths in the configuration files.

To enable requires setting the BASE_PATH environment variable in either a `.env.production` or `.env.production.local`
file, or by defining the environment variable in the Docker container.

Note that in hybrid mode you can log to either the root `/` or `/portal/login` if root is FEF or `/ff/Login` or root is
portal.
