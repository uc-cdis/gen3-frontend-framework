# Gen3 Frontend Framework

## Installation

### Prerequisites

This is a multi-workspace repo that requires npm v10. The minimum node version is set to v22.11.0.

Node can be downloaded from the official Node.js site. You may also consider using a [Node version manager](https://docs.npmjs.com/cli/v7/configuring-npm/install#using-a-node-version-manager-to-install-nodejs-and-npm).

Your version of Node may not ship with npm v10. To install it, run:

```bash
npm install npm@10.2.4 -g
```

Note: if you see this error:
```
npm ERR! code ENOWORKSPACES
npm ERR! This command does not support workspaces.
```
you can run ```npx next telemetry disable```

### Install Dependencies

From the root of the project, install dependencies by running:

```bash
npm install
```

Installing from the root of the repository is required to avoid
multiple installations of React in the workspaces. When this happens,
React will fail to render.

### Adding Dependencies

Dependencies can also be installed from the root of the repository.
To install a dependency for a specific workspace, you can run:

```bash
npm install --save my-package --workspace=packages/core
```

Since this is a TypeScript project, installing the community type definitions may also be required:

```bash
npm install --save-dev @types/my-package --workspace=packages/core
```

## Development

Run the prototype in dev mode with auto-rebuilding:

```bash
npm run dev
```

By default, this will start a dev server listening to http://localhost:3000

If you want to run the dev server but connect it to a remote Gen3 datacommons, create a `.env.development.local` file
in the `packages/sampleCommons` directory and add the following:
```bash
NEXT_PUBLIC_GEN3_API_TARGET=https://gen3.datacommons.io/
```

Note that the configuration in config needs to match the backend.

### Linting

Run ESLint for all the workspaces:

```bash
npm run lint
```

### Formatting

Run prettier for all the workspaces:

```bash
npm run format
```

## Testing

This project uses `jest` for testing.

### Naming Convention

| Test Type   | Filename         |
| ----------- | ---------------- |
| Unit        | `*.unit.test.ts` |
| Integration | `*.int.test.ts`  |

### Locations

Tests should live in the same directory as if a single module is under test. Since unit tests should only test a single module, they should also live in the directory.
For example,

```
+ /src
| - monarch.ts
| - monarch.unit.ts
| - monarch.int.ts
```

### Running tests

`npm run test` will run unit tests.

`npm run test:int` will run integration tests.

`npm run test:all` will run both unit and integration tests.

### Deployment

`docker build -t gen3ff .` will build a container with all available packages built

`docker run -p 3000:3000 -it gen3ff` will run the container from above.

The container can be viewed at `localhost:3000{BASE_PATH | /}`

Note that the base path is configurable with the `BASE_PATH` environment variable. It is left empty by default when running locally

### Using self-signed certs

```
NODE_EXTRA_CA_CERTS=$HOME/Library/Application Support/mkcert/rootCA.pem
```
